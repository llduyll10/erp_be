import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MoreThan } from 'typeorm';

import { EncryptionService } from '@/shared/services/encryption.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { TokenDto } from './dtos/token.dto';
import { RegisterCompanyDto } from './dtos/register-company.dto';
import { User, UserRole } from '@/entities/users.entity';
import { Company } from '@/entities/companies.entity';
import { UsersService } from '@/modules/users/users.service';
import { MailService } from '@/shared/services/mail.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AccessToken } from '@/entities/access-token.entity';

interface TokenPayload {
  user_id: string;
  company_id: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
    private usersService: UsersService,
    private mailService: MailService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AccessToken)
    private readonly accessTokenRepository: Repository<AccessToken>,
  ) {}

  /**
   * Validates user credentials during login
   * @param email User email
   * @param password User password
   * @returns User if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.encryptionService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);

    return user;
  }

  /**
   * Login user and generate tokens
   * @param loginDto Login credentials
   * @returns Access and refresh tokens
   */
  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    return this.generateTokens(user);
  }

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns Access and refresh tokens
   */
  async register(registerDto: RegisterDto): Promise<TokenDto> {
    const user = await this.usersService.create(registerDto);
    return this.generateTokens(user);
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken The refresh token
   * @returns New access and refresh tokens
   */
  async refreshToken(refreshToken: string): Promise<TokenDto> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // First find the user to check if it exists
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(`User not found for refresh token: ${payload.sub}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token exists in the user record
      if (!user.refresh_token) {
        this.logger.warn(`No refresh token stored for user: ${user.id}`);
        throw new UnauthorizedException('Refresh token revoked');
      }

      // Verify if the stored refresh token matches the provided one
      const isRefreshTokenValid = await this.encryptionService.compare(
        refreshToken,
        user.refresh_token,
      );

      if (!isRefreshTokenValid) {
        this.logger.warn(`Invalid refresh token for user: ${user.id}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      this.logger.log(
        `Token refresh - invalidating previous token for user: ${user.id}`,
      );

      // Invalidate the old refresh token and generate new ones in a single operation
      // Set refresh_token to empty to invalidate it
      await this.userRepository.update(user.id, {
        refresh_token: '',
      });

      // After the old token is invalidated, generate completely new tokens
      this.logger.log(
        `Token refresh - generating new tokens for user: ${user.id}`,
      );
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Refresh token error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate access and refresh tokens for a user
   * @param user User to generate tokens for
   * @returns Access and refresh tokens
   */
  async generateTokens(user: User): Promise<TokenDto> {
    this.logger.log(
      `Generating tokens for user: ${JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
      })}`,
    );

    // Create payload for JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };

    // Generate a unique identifier for this token set to help with invalidation
    const tokenId = crypto.randomBytes(16).toString('hex');

    // Create access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
      jwtid: tokenId,
    });

    // Create refresh token (longer-lived)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      jwtid: tokenId,
    });

    // Store the hashed refresh token in user record
    const hashedRefreshToken = await this.encryptionService.hash(refreshToken);
    user.refresh_token = hashedRefreshToken;
    await this.userRepository.save(user);

    // Store access token in database for additional tracking or revocation
    const accessTokenEntity = this.accessTokenRepository.create({
      token: accessToken,
      user: { id: user.id },
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
    await this.accessTokenRepository.save(accessTokenEntity);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Registers a new company with an admin user
   * @param registerCompanyDto Data for company and admin registration
   * @returns Access token and company/user data
   */
  async registerCompany(registerCompanyDto: RegisterCompanyDto): Promise<{
    access_token: string;
    user: Partial<User>;
    company: Partial<Company>;
  }> {
    const { company_name, admin } = registerCompanyDto;

    // Check if company with the same name already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { name: company_name },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this name already exists');
    }

    // Check if user with the same email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: admin?.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create transaction to ensure both company and user are created
    const queryRunner =
      this.companyRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create company
      const company = this.companyRepository.create({
        name: company_name,
        email: admin.email, // Using admin email for company email initially
      });
      const savedCompany = await queryRunner.manager.save(company);

      // Hash password
      const hashedPassword = await this.hashPassword(admin.password);

      // Create admin user
      const user = this.userRepository.create({
        full_name: admin.full_name,
        email: admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        company_id: savedCompany.id,
      });
      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      // Generate JWT token
      const payload: TokenPayload = {
        user_id: savedUser.id,
        company_id: savedCompany.id,
        role: savedUser.role,
      };
      const accessToken = this.jwtService.sign(payload);

      this.logger.log(
        `Company registered: ${savedCompany.name} with admin: ${savedUser.email}`,
      );

      return {
        access_token: accessToken,
        user: {
          id: savedUser.id,
          full_name: savedUser.full_name,
          email: savedUser.email,
          role: savedUser.role,
        },
        company: {
          id: savedCompany.id,
          name: savedCompany.name,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to register company: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to register company');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Hashes a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Get user profile data by email
   * @param email User email
   * @returns User profile data without sensitive information
   */
  async getUserProfile(email: string): Promise<Partial<User>> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return this.usersService.mapToProfile(user);
  }

  /**
   * Request password reset email
   * @param email User email
   */
  async forgotPassword(email: string): Promise<void> {
    // Find the user
    const user = await this.userRepository.findOne({ where: { email } });

    // Don't reveal if the user exists or not (security)
    if (!user) {
      this.logger.log(
        `Password reset requested for non-existent email: ${email}`,
      );
      return;
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token for storage (don't store plain tokens in DB)
    const hashedToken = await this.encryptionService.hash(resetToken);

    // Set reset token and expiry (1 hour from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Store token in user record
    user.password_reset_token = hashedToken;
    user.password_reset_expires = expiryDate;
    await this.userRepository.save(user);

    this.logger.log(`Password reset token generated for ${email}`);

    // Send email with reset link
    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.full_name,
      );

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      // Don't expose error to client, but do log it
      this.logger.error(
        `Failed to send password reset email: ${error.message}`,
      );
    }
  }

  /**
   * Reset password with token
   * @param resetPasswordDto Password reset data
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password, password_confirmation } = resetPasswordDto;

    if (password !== password_confirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user with valid reset token
    const hashedToken = await this.encryptionService.hash(token);
    const user = await this.userRepository.findOne({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Update password and clear reset token
    user.password = await this.encryptionService.hash(password);
    user.password_reset_token = '';
    user.password_reset_expires = new Date();
    await this.userRepository.save(user);
  }

  /**
   * Logout user by invalidating their refresh token
   * @param userId The ID of the user to log out
   */
  async logout(userId: string): Promise<void> {
    if (!userId) {
      this.logger.warn('Attempted to logout without a user ID');
      return;
    }

    await this.userRepository.update(userId, {
      refresh_token: '',
    });
    this.logger.log(`User ${userId} logged out`);
  }
}
