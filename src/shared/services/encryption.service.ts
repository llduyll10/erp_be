import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
  /**
   * Hash a plain text string using bcrypt
   * @param plainText The text to hash
   * @returns Hashed string
   */
  async hash(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainText, salt);
  }

  /**
   * Compare a plain text string with a hash
   * @param plainText The plain text to check
   * @param hash The hash to compare against
   * @returns True if matching, false otherwise
   */
  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
