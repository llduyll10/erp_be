import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@/entities/users.entity';
import { RegisterDto } from '@/modules/auth/dtos/register.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find a user by email
   * @param email User's email address
   * @returns User entity if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by id
   * @param id User's unique identifier
   * @returns User entity if found
   * @throws NotFoundException if user not found
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Create a new user
   * @param registerDto Registration data for new user
   * @returns Created user entity
   * @throws ConflictException if email already exists
   */
  async create(registerDto: RegisterDto): Promise<User> {
    const { email, password, fullName } = registerDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      // Hash the password
      const hashedPassword = await this.hashPassword(password);

      // Create and save the user
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        fullName,
        role: UserRole.ADMIN, // Default role
      });

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Update user information
   * @param id User ID
   * @param updateUserDto Data to update
   * @returns Updated user entity
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If updating email, check if it's unique
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    try {
      // If updating password, hash it
      if (updateUserDto.password) {
        updateUserDto.password = await this.hashPassword(
          updateUserDto.password,
        );
      }

      // Update user
      await this.userRepository.update(id, updateUserDto);

      // Return updated user
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Update user's last login timestamp
   * @param id User's unique identifier
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.userRepository.update(id, {
        lastLoginAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to update last login: ${error.message}`,
        error.stack,
      );
      // Not throwing error to avoid disrupting login flow
    }
  }

  /**
   * Set refresh token for a user
   * @param id User's unique identifier
   * @param refreshToken JWT refresh token
   */
  async setRefreshToken(id: string, refreshToken: string): Promise<void> {
    try {
      // Hash the refresh token before storing
      const hashedRefreshToken = await this.hashToken(refreshToken);

      await this.userRepository.update(id, {
        refreshToken: hashedRefreshToken,
      });
    } catch (error) {
      this.logger.error(
        `Failed to set refresh token: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to set refresh token');
    }
  }

  /**
   * Map User entity to UserProfileDto
   * @param user User entity
   * @returns Partial user object with safe data
   */
  mapToProfile(user: User): Partial<User> {
    const { password, refreshToken, ...result } = user;
    return result;
  }

  /**
   * Hash a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Hash a token using bcrypt
   * @param token Plain text token
   * @returns Hashed token
   */
  private async hashToken(token: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(token, salt);
  }
}
