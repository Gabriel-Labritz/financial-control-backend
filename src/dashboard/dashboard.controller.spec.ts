import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { randomUUID } from 'crypto';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

const mockAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    request.user = mockTokenPayload;
    return true;
  }),
};

const mockTokenPayload = {
  id: randomUUID(),
  name: 'John',
};

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            balance: jest.fn(),
            monthlyBalance: jest.fn(),
            lastTransactions: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('summary', () => {
    it('should call dashboardService.balance with tokenPayload and return success message', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const successMessage = { message: 'your balance was loded' };

      // mocks
      const spyBalance = jest
        .spyOn(dashboardService, 'balance')
        .mockResolvedValue(successMessage as any);

      // action
      const result = await controller.getUserBalance(tokenPayload as any);

      // asserts
      expect(spyBalance).toHaveBeenCalledWith(tokenPayload);
      expect(result).toEqual(successMessage);
    });

    it('should throw HttpException when the dashboardService.balance throw an error', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const errorMessage = 'user not found';

      // mocks
      jest
        .spyOn(dashboardService, 'balance')
        .mockRejectedValue(new NotFoundException(errorMessage));

      // action and asserts
      await expect(
        controller.getUserBalance(tokenPayload as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.getUserBalance(tokenPayload as any),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('monthly-balance', () => {
    it('should call dashboardService.monthlyBalance with tokenPayload and return success message', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const successMessage = { message: 'your monthlyBalance was loded' };

      // mocks
      const spyMonthlyBalance = jest
        .spyOn(dashboardService, 'monthlyBalance')
        .mockResolvedValue(successMessage as any);

      // action
      const result = await controller.getMonthlyBalance(tokenPayload as any);

      // asserts
      expect(spyMonthlyBalance).toHaveBeenCalledWith(tokenPayload);
      expect(result).toEqual(successMessage);
    });

    it('should throw HttpException when the dashboardService.balance throw an error', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const errorMessage = 'user not found';

      // mocks
      jest
        .spyOn(dashboardService, 'monthlyBalance')
        .mockRejectedValue(new NotFoundException(errorMessage));

      // action and asserts
      await expect(
        controller.getMonthlyBalance(tokenPayload as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.getMonthlyBalance(tokenPayload as any),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('last-transactions', () => {
    it('should call dashboardService.lastTransaction with tokenPayload and return success message', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const successMessage = { message: 'your last transactions was loded' };

      // mocks
      const spyLastTransactions = jest
        .spyOn(dashboardService, 'lastTransactions')
        .mockResolvedValue(successMessage as any);

      // action
      const result = await controller.getLastTransaction(tokenPayload as any);

      // asserts
      expect(spyLastTransactions).toHaveBeenCalledWith(tokenPayload);
      expect(result).toEqual(successMessage);
    });

    it('should throw HttpException when the dashboardService.lastTransactions throw an error', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const errorMessage = 'user not found';

      // mocks
      jest
        .spyOn(dashboardService, 'lastTransactions')
        .mockRejectedValue(new NotFoundException(errorMessage));

      // action and asserts
      await expect(
        controller.getLastTransaction(tokenPayload as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.getLastTransaction(tokenPayload as any),
      ).rejects.toThrow(errorMessage);
    });
  });
});
