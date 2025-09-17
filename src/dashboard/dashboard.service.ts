import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';
import { TransactionTypes } from '../common/enums/transaction/transaction_types.enum';
import { responseErrorsDashboardMessage } from '../common/enums/erros/errors_dashboard/response_errors_dashboard_messages.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly transactionService: TransactionService) {}

  async balance(tokenPayload: TokenPayloadDto) {
    try {
      const allTransactions =
        await this.transactionService.findAllTransactionByUserId(tokenPayload);

      // calculate total income and total expense
      const summary = allTransactions.reduce(
        (acc, transaction) => {
          const amount = Number(transaction.amount);

          if (transaction.type === TransactionTypes.EXPENSE) {
            acc.totalExpenses += amount;
          } else {
            acc.totalIncomes += amount;
          }

          return acc;
        },
        { totalExpenses: 0, totalIncomes: 0 },
      );

      // calculate total balance
      const totalExpenses = Number(summary.totalExpenses.toFixed(2));
      const totalIncomes = Number(summary.totalIncomes.toFixed(2));
      const totalBalance = Number((totalIncomes - totalExpenses).toFixed(2));

      return {
        totalIncomes,
        totalExpenses,
        totalBalance,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsDashboardMessage.ERROR_LOAD_BALANCE,
      );
    }
  }
}
