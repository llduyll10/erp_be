import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity('access_tokens')
export class AccessToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string; // Hashed refresh token

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ default: false })
  is_revoked: boolean;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  // Relations
  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.access_tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
