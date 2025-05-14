import { join } from 'path';
import { registerAs } from '@nestjs/config';
import { DriverType, StorageModuleOptions } from '@codebrew/nestjs-storage';

// Export the interface to use as a type elsewhere
export interface StorageConfig extends StorageModuleOptions { }

export default registerAs('storage', (): StorageConfig => {
  // Optional: Get credentials from a separate file if you have a credentials system
  // const credentials = getCredentials();

  return {
    default: process.env.STORAGE_DISK || 'local',
    disks: {
      local: {
        driver: DriverType.LOCAL,
        config: {
          root: join(__dirname, '..', '..', 'uploads'),
          publicUrl: `${process.env.API_URL || 'http://localhost:3000'}/uploads`,
        },
      },
      s3: {
        driver: DriverType.S3,
        config: {
          key: process.env.S3_KEY || '',
          secret: process.env.S3_SECRET || '',
          endpoint: process.env.S3_ENDPOINT ||
            `https://s3.${process.env.AWS_DEFAULT_REGION || 'ap-northeast-1'}.amazonaws.com`,
          bucket: process.env.S3_BUCKET || '',
          region: process.env.AWS_DEFAULT_REGION || 'ap-northeast-1',
          // Optional S3 configuration parameters
          forcePathStyle: Boolean(process.env.S3_FORCE_PATH_STYLE || false),
          signatureVersion: process.env.S3_SIGNATURE_VERSION || 'v4',
        },
      },
    },
  };
}); 