import { Injectable } from '@nestjs/common';
import { TokenPayloadDto } from 'src/auth/dto/token_payload.dto';
import { CreateTransactionDto } from './dto/create_transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entity/Transaction';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly userService: UserService,
  ) {}
  create(
    createTransactionDto: CreateTransactionDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const { title, amount, type, category, description } = createTransactionDto;

    try {
      console.log(createTransactionDto);
      return 'this route will create a transaction';
    } catch (err) {}
  }
}
