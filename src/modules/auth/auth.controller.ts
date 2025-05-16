import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { TokenDto } from './dtos/token.dto';
import { RegisterCompanyDto } from './dtos/register-company.dto';
import { Public } from '@/common/decorators/auth.decorators';
import { ResponseTransformer } from '@/utils/transformers/response.transformer';
import {
  AuthResponseDto,
  RegisterCompanyResponseDto,
  UserResponseDto,
  CompanyResponseDto,
} from './dtos/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login with email and password
   * @param loginDto Login credentials
   * @returns JWT tokens
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    const userProfile = await this.authService.getUserProfile(loginDto.email);

    const authResponse = new AuthResponseDto({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: userProfile as UserResponseDto,
    });

    return ResponseTransformer.transform(authResponse, 'Login successful');
  }

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns JWT tokens
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    const authResponse = new AuthResponseDto({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: (await this.authService.getUserProfile(
        registerDto.email,
      )) as UserResponseDto,
    });

    return ResponseTransformer.transform(
      authResponse,
      'User registered successfully',
    );
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken JWT refresh token
   * @returns New JWT tokens
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refresh successful',
    type: TokenDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    const result = await this.authService.refreshToken(refreshToken);
    return ResponseTransformer.transform(
      result,
      'Token refreshed successfully',
    );
  }

  /**
   * Registers a new company with an admin user
   * @param registerCompanyDto Company and admin registration data
   * @returns JWT token and user/company information
   */
  @Public()
  @Post('register-company')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new company with admin user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company and admin user registered successfully',
    type: RegisterCompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Company or email already exists',
  })
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto) {
    const result = await this.authService.registerCompany(registerCompanyDto);

    // Create explicit typed objects for user and company
    const userResponse = new UserResponseDto({
      ...result.user,
      email: result.user.email || '',
      fullName: result.user.fullName || '',
      role: result.user.role,
      companyId: result.user.companyId || '',
    });

    const companyResponse = new CompanyResponseDto({
      ...result.company,
      name: result.company.name || '',
    });

    return ResponseTransformer.transform(
      new RegisterCompanyResponseDto({
        accessToken: result.accessToken,
        user: userResponse,
        company: companyResponse,
      }),
      'Company registered successfully',
    );
  }
}
