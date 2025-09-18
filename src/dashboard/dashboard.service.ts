import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';
import { TransactionTypes } from '../common/enums/transaction/transaction_types.enum';
import { responseErrorsDashboardMessage } from '../common/enums/erros/errors_dashboard/response_errors_dashboard_messages.enum';
import { MonthlySummary } from './interfaces/dashboard.intefaces';

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

  async monthlyBalance(tokenPayload: TokenPayloadDto) {
    try {
      // get all user transactions
      const allTransactions =
        await this.transactionService.findAllTransactionByUserId(tokenPayload);

      // calculate monthly balance
      const monthlySummary = allTransactions.reduce((acc, transaction) => {
        const month = new Date(transaction.createdAt).toISOString().slice(0, 7); // 2025 - 09

        // create the month object if not exists on acc
        if (!acc[month]) {
          acc[month] = {
            totalIncomes: 0,
            totalExpenses: 0,
          };
        }

        // calculate total income and total expense
        const amount = Number(transaction.amount);
        if (transaction.type === TransactionTypes.EXPENSE) {
          acc[month].totalExpenses += amount;
        } else {
          acc[month].totalIncomes += amount;
        }

        return acc;
      }, {} as MonthlySummary);

      const formattedSummary = Object.keys(monthlySummary).map((month) => {
        return {
          month,
          totalIncomes: Number(monthlySummary[month].totalIncomes.toFixed(2)),
          totalExpenses: Number(monthlySummary[month].totalExpenses.toFixed(2)),
        };
      });

      return formattedSummary;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsDashboardMessage.ERROR_LOAD_MONTHLY_BALANCE,
      );
    }
  }

  async lastTransactions(tokenPayload: TokenPayloadDto) {
    try {
      const paginationDto = { limit: 6, page: 1 };

      const { message, userTransactions } =
        await this.transactionService.findAll(paginationDto, tokenPayload);

      return {
        message,
        userTransactions,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsDashboardMessage.ERROR_LOAD_LAST_TRANSACTIONS,
      );
    }
  }
}
