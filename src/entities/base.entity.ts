import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Column,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @VersionColumn()
  version: number;

  @Column({ name: 'is_deleted', default: false })
  is_deleted: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamps() {
    this.updated_at = new Date();
  }
} 