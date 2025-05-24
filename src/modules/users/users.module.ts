import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PolicyModule } from '@/modules/auth/casl/policy.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PolicyModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
