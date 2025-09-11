import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateTransactionDto } from './dto/create_transaction.dto';
import { TokenPayloadParam } from '../common/params/token_payload.param';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';

@UseGuards(AuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  @Post('create')
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.create(createTransactionDto, tokenPayload);
  }
}
