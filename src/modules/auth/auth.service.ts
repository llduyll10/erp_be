import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { EncryptionService } from '@/shared/services/encryption.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { TokenDto } from './dtos/token.dto';
import { RegisterCompanyDto } from './dtos/register-company.dto';
import { User, UserRole } from '@/entities/users.entity';
import { Company } from '@/entities/companies.entity';
import { UsersService } from '@/modules/users/users.service';

interface TokenPayload {
  userId: string;
  companyId: string;
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
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
   * @param refreshToken JWT refresh token
   * @returns New access and refresh tokens
   */
  async refreshToken(refreshToken: string): Promise<TokenDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await this.encryptionService.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate JWT tokens for a user
   * @param user User entity
   * @returns Access and refresh tokens
   */
  private async generateTokens(user: User): Promise<TokenDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    await this.usersService.setRefreshToken(user.id, refreshToken);

    return new TokenDto({
      accessToken,
      refreshToken,
    });
  }

  /**
   * Registers a new company with an admin user
   * @param registerCompanyDto Data for company and admin registration
   * @returns Access token and company/user data
   */
  async registerCompany(registerCompanyDto: RegisterCompanyDto): Promise<{
    accessToken: string;
    user: Partial<User>;
    company: Partial<Company>;
  }> {
    const { companyName, admin } = registerCompanyDto;

    // Check if company with the same name already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { name: companyName },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this name already exists');
    }

    // Check if user with the same email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: admin.email },
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
        name: companyName,
        email: admin.email, // Using admin email for company email initially
      });
      const savedCompany = await queryRunner.manager.save(company);

      // Hash password
      const hashedPassword = await this.hashPassword(admin.password);

      // Create admin user
      const user = this.userRepository.create({
        fullName: admin.fullName,
        email: admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        companyId: savedCompany.id,
      });
      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      // Generate JWT token
      const payload: TokenPayload = {
        userId: savedUser.id,
        companyId: savedCompany.id,
        role: savedUser.role,
      };
      const accessToken = this.jwtService.sign(payload);

      this.logger.log(
        `Company registered: ${savedCompany.name} with admin: ${savedUser.email}`,
      );

      return {
        accessToken,
        user: {
          id: savedUser.id,
          fullName: savedUser.fullName,
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
}
