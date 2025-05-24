import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
