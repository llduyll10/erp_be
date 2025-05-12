import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import configs from '../config/app.config';

const configService = new ConfigService(configs());

const options = {
  type: configService.get('database.type') || 'postgres',
  host: configService.get('database.host') || 'localhost',
  port: configService.get('database.port') || 5432,
  username: configService.get('database.username') || 'postgres',
  password: configService.get('database.password') || 'postgres',
  database: configService.get('database.database') || 'erp_development',
  synchronize: false,
  dropSchema: false,
  logging: !['production', 'test'].includes(configService.get('app.nodeEnv') || 'development'),
  entities: [__dirname + '/../entities/**/*{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy(),
  autoLoadEntities: true,
} as DataSourceOptions;

export const dataSource = new DataSource(options);

export default options;
