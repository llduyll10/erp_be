import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { MAX_LENGTH_INPUT } from '@/constants/index';

@Entity('access_tokens')
export class AccessToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
  token: string;

  @Index()
  @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
  refresh_token: string;

  @Column({ nullable: false, type: 'uuid' })
  user_id: string;

  @Column({ nullable: false, type: 'uuid' })
  company_id: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ default: false })
  is_revoked: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
