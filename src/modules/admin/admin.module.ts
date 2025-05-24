import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
