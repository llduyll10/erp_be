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
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamps() {
    this.updatedAt = new Date();
  }
} 