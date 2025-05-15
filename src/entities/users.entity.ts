import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MAX_LENGTH_INPUT } from '@/constants/app.constants';
import { UserRoleEnum } from '@/entities/enums/user.enum';
import { Company } from './companies.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  company_id: string;

  @Column({ type: 'varchar', length: MAX_LENGTH_INPUT, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: MAX_LENGTH_INPUT, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: MAX_LENGTH_INPUT, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: MAX_LENGTH_INPUT, nullable: false })
  password_hash: string;

  @Column({ type: 'enum', enum: UserRoleEnum, nullable: false })
  role: UserRoleEnum;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  //=========RELATIONS========
  @ManyToOne(() => Company, (companies) => companies.users, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'company_id' })
  companies: Company;

  // =======DATES==============
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
