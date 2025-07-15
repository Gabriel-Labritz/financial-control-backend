import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthTokenGuard } from 'src/common/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/common/param/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { FilterByMonthDto } from './dto/filter-by-month.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
@UsePipes(ParseIntIdPipe)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(AuthTokenGuard)
  @Post('create')
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.create(createTransactionDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Get()
  findAll(
    @Query() filter: FilterTransactionDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.findAll(filter, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Get('by-month')
  findByMonth(
    @Query() filter: FilterByMonthDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.findByMonth(filter, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.findOne(id, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch('update/:id')
  update(
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.update(
      id,
      updateTransactionDto,
      tokenPayload,
    );
  }

  @UseGuards(AuthTokenGuard)
  @Delete('remove/:id')
  delete(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.transactionService.delete(id, tokenPayload);
  }
}
