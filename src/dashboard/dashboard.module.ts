import { Module } from '@nestjs/common';
import { TransactionModule } from 'src/transaction/transaction.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TransactionModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
