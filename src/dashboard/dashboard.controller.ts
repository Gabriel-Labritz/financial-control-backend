import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { TokenPayloadParam } from '../common/params/token_payload.param';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getUserBalance(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.dashboardService.balance(tokenPayload);
  }
}
