import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../../base/services/encryption.service';

// Không cần import nhiều file seed riêng lẻ nữa vì chúng ta sẽ dùng typeorm-extension
// File này có thể làm điểm khởi đầu tùy chọn cho các seed script cũ nếu cần

async function runSeeds() {
  console.log('Seeding database...');
  
  // Với cách seed mới, các file seeders sẽ được tự động tìm và chạy bởi typeorm-extension
  // Không cần gọi chúng thủ công ở đây nữa
  
  console.log('Database seeding completed!');
}

// Chỉ chạy khi file được gọi trực tiếp
if (require.main === module) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error during database seeding:', error);
      process.exit(1);
    });
}

export default runSeeds; 