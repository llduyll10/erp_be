import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserProfileDto } from './dtos/user-profile.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { RequestWithUser } from '@/common/interfaces/request.interface';
import { ResponseTransformer } from '@/utils/transformers/response.transformer';
import { ResponseDTO } from '@/base/dtos/response.dto';
import { PoliciesGuard } from '@/common/guards/policy.guard';
import { CheckPolicies } from '@/decorators/policy.decorator';
import { Action } from '@/common/enums/action.enum';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@/entities/users.entity';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get user profile by ID
   * @param id User ID
   * @returns User profile data
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => {
    return ability.can(Action.Read, User);
  })
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    type: ResponseDTO,
    description: 'Return the user profile.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDTO<UserProfileDto>> {
    try {
      const user = await this.usersService.findOne(id);
      const profileData = this.usersService.mapToProfile(user);

      return ResponseTransformer.transform(
        new UserProfileDto(profileData),
        'User profile retrieved successfully',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Get current user profile (based on JWT token)
   * @returns Current user profile data
   */
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    type: ResponseDTO,
    description: 'Return the current user profile.',
  })
  async getProfile(
    @Req() req: RequestWithUser,
  ): Promise<ResponseDTO<UserProfileDto>> {
    try {
      const userId = req.user.userId;
      const user = await this.usersService.findOne(userId);
      const profileData = this.usersService.mapToProfile(user);
      return ResponseTransformer.transform(
        new UserProfileDto(profileData),
        'User profile retrieved successfully',
      );
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Update user profile
   * @param req Request with user information
   * @param updateUserDto Data to update
   * @returns Updated user profile
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    type: ResponseDTO,
    description: 'Return the updated user profile.',
  })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDTO<UserProfileDto>> {
    const userId = req.user.userId;
    const updatedUser = await this.usersService.updateUser(
      userId,
      updateUserDto,
    );
    const profileData = this.usersService.mapToProfile(updatedUser);
    return ResponseTransformer.transform(
      new UserProfileDto(profileData),
      'User profile updated successfully',
    );
  }
}
