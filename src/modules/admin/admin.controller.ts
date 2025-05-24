import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/entities/users.entity';
import { ResponseTransformer } from '@/utils/transformers/response.transformer';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  /**
   * Get admin dashboard data - only accessible by admins
   */
  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource for the user role',
  })
  getDashboard() {
    return ResponseTransformer.transform(
      { data: 'Admin dashboard data' },
      'Admin dashboard data retrieved',
    );
  }

  /**
   * Get sales data - accessible by admins and sales roles
   */
  @Get('sales')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @ApiOperation({ summary: 'Get sales data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource for the user role',
  })
  getSalesData() {
    return ResponseTransformer.transform(
      { data: 'Sales data' },
      'Sales data retrieved',
    );
  }

  /**
   * Get warehouse data - accessible by all roles
   */
  @Get('warehouse')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Get warehouse data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Warehouse data retrieved successfully',
  })
  getWarehouseData() {
    return ResponseTransformer.transform(
      { data: 'Warehouse data' },
      'Warehouse data retrieved',
    );
  }
}
