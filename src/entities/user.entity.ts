import {
    Entity,
    Index,
  } from 'typeorm';
  import {
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { MAX_LENGTH_INPUT } from '@/constants/app.constants';
  
  export enum RoleEnum {
    STAFF_ADMIN = 'staff_admin',
    STAFF_GENERAL = 'staff_general',
  }
  
  export enum UserTypeEnum {
    STAFF = 'staff',
    CUSTOMER = 'customer',
    SUPPLIER = 'supplier',
    CONTRACTOR = 'contractor',
  }
  
  @Entity('users')
  @Index(['user_type', 'email'], { unique: true })
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    @Column({
      nullable: false,
      type: 'varchar',
      length: MAX_LENGTH_INPUT,
      default: '',
    })
    encrypted_password = '';
  
    @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
    email: string;
  
    @Column({
      nullable: true,
      type: 'varchar',
      length: MAX_LENGTH_INPUT,
      unique: true,
    })
    reset_password_token: string;
  
    @Column({ nullable: true, type: 'timestamp' })
    reset_password_sent_at: Date;
  
    @Column({ nullable: true, type: 'timestamp' })
    current_sign_in_at: Date;
  
    @Column({ nullable: true, type: 'timestamp' })
    last_sign_in_at: Date;
  
    @Column({ nullable: true, type: 'varchar', length: MAX_LENGTH_INPUT })
    current_sign_in_ip: string;
  
    @Column({ nullable: true, type: 'varchar', length: MAX_LENGTH_INPUT })
    last_sign_in_ip: string;
  
    @Column({ nullable: false, type: 'integer', default: 0 })
    sign_in_count = 0;
  
    @Column({ nullable: true, type: 'varchar', length: MAX_LENGTH_INPUT })
    password: string;
  
    @Column({ nullable: true, type: 'varchar', length: MAX_LENGTH_INPUT })
    password_confirmation: string;
  
    @Column({ nullable: true, type: 'timestamp' })
    locked_at: Date;
  
    @Column({ nullable: false, type: 'integer', default: 0 })
    failed_attempts = 0;
  
    @Column({
      nullable: true,
      type: 'varchar',
      length: MAX_LENGTH_INPUT,
      unique: true,
    })
    unlock_token: string;
  
    @Column({
      nullable: true,
      type: 'enum',
      enum: RoleEnum,
    })
    role: RoleEnum;
  
    @Column({
      nullable: false,
      type: 'enum',
      enum: UserTypeEnum,
    })
    user_type: UserTypeEnum;
  
    
  
    @Column({ type: 'varchar', length: MAX_LENGTH_INPUT, nullable: true })
    user_code: string; // using for import csv import
  
    
  }
  