import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '@/entities/users.entity';
import { Company } from '@/entities/companies.entity';
import { AccessToken } from '@/entities/access-token.entity';
import { UsersModule } from '@/modules/users/users.module';
import { ShareModule } from '@/shared/share.module';
import { PolicyModule } from './casl/policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company, AccessToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
    UsersModule,
    ShareModule,
    PolicyModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule, PolicyModule],
})
export class AuthModule {}
