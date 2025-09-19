import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';
import {
  ConflictException,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthGuard } from '../common/guards/auth.guard';

const mockTokenPayload = {
  id: randomUUID(),
  name: 'John',
};

const mockAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    request.user = mockTokenPayload;
    return true;
  }),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            getUser: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call userService.create with the correct DTO and return success message', async () => {
      // arranges
      const createUserDto: CreateUserDto = {
        name: 'John',
        email: 'john@gmail.com',
        password: 'Testing123',
      };
      const expectedResponse = { message: 'user created successfully' };

      // mocks
      const spyCreateUserService = jest
        .spyOn(userService, 'create')
        .mockResolvedValue(expectedResponse as any);

      // action
      const result = await controller.signUp(createUserDto);

      // asserts
      expect(spyCreateUserService).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException when userService.create throws an http error', async () => {
      // arranges
      const createUserDto: CreateUserDto = {
        name: 'John',
        email: 'john@gmail.com',
        password: 'Testing123',
      };
      const errorMessage = 'email is alrealy in use';

      // mocks
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new ConflictException(errorMessage));

      // action and assert
      await expect(controller.signUp(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.signUp(createUserDto)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('getProfileUser', () => {
    it('should call userService.getUser with token payload and return success message', async () => {
      // arranges
      const expectedResponse = { message: 'user loaded successfully' };

      // mocks
      const spyGetUserService = jest
        .spyOn(userService, 'getUser')
        .mockResolvedValue(expectedResponse as any);

      // action
      const result = await controller.getProfileUser(mockTokenPayload as any);

      // asserts
      expect(spyGetUserService).toHaveBeenCalledWith(mockTokenPayload);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException when userService.getUser throws an http error', async () => {
      // arranges
      const errorMessage = 'user not found';

      // mocks
      jest
        .spyOn(userService, 'getUser')
        .mockRejectedValue(new NotFoundException(errorMessage));

      // action and assert
      await expect(
        controller.getProfileUser(mockTokenPayload as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.getProfileUser(mockTokenPayload as any),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteUserAccount', () => {
    it('should call userService.remove with token payload, clear cookie and return success message', async () => {
      // arranges
      const expectedMessage = 'user deleted successfully';
      const expectedResult = { message: expectedMessage };
      const { message } = expectedResult;

      // mocks
      const spyRemoveUserService = jest
        .spyOn(userService, 'remove')
        .mockResolvedValue(expectedResult as any);

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as { clearCookie: jest.Mock };

      // action
      const result = await controller.deleteUserAccount(
        mockResponse as any,
        mockTokenPayload as any,
      );

      // asserts
      expect(spyRemoveUserService).toHaveBeenCalledWith(mockTokenPayload);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt');
      expect(result).toEqual(message);
    });

    it('should throw HttpException when userService.remove throw an http error', async () => {
      // arranges
      const errorMessage = 'user not found';

      // mocks
      jest
        .spyOn(userService, 'remove')
        .mockRejectedValue(new NotFoundException(errorMessage));

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      // action and asserts
      await expect(
        controller.deleteUserAccount(mockResponse, mockTokenPayload as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.deleteUserAccount(mockResponse, mockTokenPayload as any),
      ).rejects.toThrow(errorMessage);
    });
  });
});
