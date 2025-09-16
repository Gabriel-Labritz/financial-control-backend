import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateTransactionDto } from './dto/create_transaction.dto';
import { TokenPayloadParam } from '../common/params/token_payload.param';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateTransactionDto } from './dto/update_transaction.dto';

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

  @Get('all')
  findAllUserTransactions(
    @Query() pagination: PaginationDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.findAll(pagination, tokenPayload);
  }

  @Get(':id')
  findOneTransaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.findOne(id, tokenPayload);
  }

  @Patch('update/:id')
  updateTransaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @TokenPayloadParam() tokenPaylaod: TokenPayloadDto,
  ) {
    return this.transactionService.update(
      id,
      updateTransactionDto,
      tokenPaylaod,
    );
  }

  @Delete('delete/:id')
  deleteTransaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.remove(id, tokenPayload);
  }
}
