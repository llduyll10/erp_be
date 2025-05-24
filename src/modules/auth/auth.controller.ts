import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
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
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

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
      access_token: result.access_token,
      refresh_token: result.refresh_token,
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
      access_token: result.access_token,
      refresh_token: result.refresh_token,
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
   * Refresh access token
   * @param refreshTokenDto Refresh token data
   * @returns New access and refresh tokens
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New access and refresh tokens',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<any> {
    const newTokens = await this.authService.refreshToken(
      refreshTokenDto.refresh_token,
    );

    return ResponseTransformer.transform(
      newTokens,
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
      full_name: result.user.full_name || '',
      role: result.user.role,
      company_id: result.user.company_id || '',
    });

    const companyResponse = new CompanyResponseDto({
      ...result.company,
      name: result.company.name || '',
    });

    return ResponseTransformer.transform(
      new RegisterCompanyResponseDto({
        access_token: result.access_token,
        user: userResponse,
        company: companyResponse,
      }),
      'Company registered successfully',
    );
  }

  /**
   * Request password reset
   * @param forgotPasswordDto Email for reset
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent if email exists',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return ResponseTransformer.transform(
      null,
      'If your email exists in our system, you will receive a password reset link',
    );
  }

  /**
   * Reset password with token
   * @param resetPasswordDto Password reset data
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password has been reset',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid token or passwords do not match',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return ResponseTransformer.transform(
      null,
      'Password has been reset successfully',
    );
  }

  /**
   * Logout user and invalidate their refresh token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
  })
  async logout(@Req() req: RequestWithUser) {
    await this.authService.logout(req.user.userId);
    return ResponseTransformer.transform(null, 'Logged out successfully');
  }
}
