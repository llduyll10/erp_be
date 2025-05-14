import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MAX_LENGTH_INPUT } from '@/constants/index';

@Entity('storage_files')
export class StorageFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
  file_path: string;

  @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
  origin_name: string;

  @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
  mime_type: string;

  @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
  checksum: string;

  @Column({ nullable: false, type: 'integer' })
  size: number;

  @Column({ nullable: false, type: 'varchar', length: MAX_LENGTH_INPUT })
  disk: string;

  @Column({ nullable: true, type: 'integer' })
  uploader_id?: number;

  // Virtual column
  url: string;

  @Column({ nullable: true, type: 'timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  @CreateDateColumn()
  updated_at: Date;
}
