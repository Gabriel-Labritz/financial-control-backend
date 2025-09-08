import { HashingProtocol } from './hashing-protocol';
import * as bcrypt from 'bcrypt';

export class HashingService implements HashingProtocol {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
