import { Module } from '@nestjs/common';
import { HashingProtocol } from './hashing/hashing-protocol';
import { HashingService } from './hashing/hashing.service';

@Module({
  providers: [{ provide: HashingProtocol, useClass: HashingService }],
  exports: [HashingProtocol],
})
export class AuthModule {}
