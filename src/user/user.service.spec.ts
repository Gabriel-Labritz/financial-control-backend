import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingProtocol } from 'src/auth/hashing/hashing.protocol';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponseDto } from 'src/common/dtos/api-response.dto';
import { ResponseSuccessMessages } from 'src/common/enum/response-success-messages.enum';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let hashingService: HashingProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: HashingProtocol,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingProtocol>(HashingProtocol);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a successfully user', async () => {
      // arrange
      const createUserDto: CreateUserDto = {
        nickName: 'Testing',
        email: 'testing@gmail.com',
        password: 'testing123',
      };
      const passwordHash = 'HASHINGPASSWORDTEST123';
      const newUser = {
        id: 1,
        nickName: createUserDto.nickName,
        email: createUserDto.email,
        password: passwordHash,
      };

      const spyHashPassword = jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue(passwordHash);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);
      const spyRepositorySave = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(newUser as any);

      // action
      const result = await userService.create(createUserDto);

      // assert
      expect(spyHashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(spyRepositorySave).toHaveBeenCalledWith(newUser);
      expect(result).toStrictEqual(
        new ApiResponseDto({ message: ResponseSuccessMessages.USER_CREATED }),
      );
    });

    it('should throw a ConflictException if user email already exists', async () => {
      // arrange
      const createUserDto: CreateUserDto = {
        nickName: 'Testing',
        email: 'testing@gmail.com',
        password: 'testing123',
      };

      const simulateError = new QueryFailedError('', [], new Error());
      simulateError['code'] = '23505';

      jest.spyOn(userRepository, 'save').mockRejectedValue(simulateError);

      // assert
      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw an HttpException', async () => {
      // arrange
      const createUserDto: CreateUserDto = {
        nickName: 'Testing',
        email: 'testing@gmail.com',
        password: 'testing123',
      };
      const httpError = new BadRequestException();

      jest.spyOn(userRepository, 'save').mockRejectedValue(httpError);

      // assert
      await expect(userService.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw an InternalServerErrorException for others errors', async () => {
      // arrange
      const createUserDto: CreateUserDto = {
        nickName: 'Testing',
        email: 'testing@gmail.com',
        password: 'testing123',
      };
      const genericError = new Error();

      jest.spyOn(userRepository, 'save').mockRejectedValue(genericError);

      // assert
      await expect(userService.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findUser', () => {
    it('should find and return the logged user data successfully', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nick_name: 'Testing',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nick_name,
        createdAt: new Date(),
        transactions: [
          {
            id: 1,
            title: 'Testing',
            amount: 1.95,
            type: 'expense',
            category: 'other',
            createdAt: new Date(),
          },
        ],
      };

      const spyUserRepository = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(user as any);

      // action
      const result = await userService.findUser(tokenPayload as any);

      expect(spyUserRepository).toHaveBeenCalledWith({
        where: { id: tokenPayload.id },
        relations: ['transactions'],
        select: ['id', 'nickName', 'createdAt', 'transactions'],
      });
      expect(result).toBe(user);
    });

    it('should throw a NotFoundException when user not found', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nick_name: 'Testing',
      };

      // assert
      await expect(userService.findUser(tokenPayload as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an InternalServerErrorException for another errors', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nick_name: 'Testing',
      };
      const genericError = new Error();

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(genericError);

      // assert
      await expect(userService.findUser(tokenPayload as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a user logged successfully with nickName and password', async () => {
      // Arrange
      const tokenPayload = {
        id: 1,
        nickName: 'Testing',
      };
      const updateUserDto: UpdateUserDto = {
        nickName: 'testing update',
        password: 'testing123',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        password: 'old password',
        createdAt: new Date(),
        transactions: [],
      };
      const originalPassword = updateUserDto.password;
      const passwordHash = 'TESTINGHASHPASSWORD123';
      const userUpdated = {
        ...user,
        nickName: updateUserDto.nickName,
        password: passwordHash,
      };

      // mocks
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyHashPassword = jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue(passwordHash);
      const spySave = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userUpdated as any);

      // Action
      const result = await userService.update(
        updateUserDto,
        tokenPayload as any,
      );

      // Assert
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyHashPassword).toHaveBeenCalledWith(originalPassword);
      expect(user.nickName).toBe(updateUserDto.nickName);
      expect(user.password).toBe(passwordHash);
      expect(spySave).toHaveBeenCalledWith(user);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.USER_UPDATED,
        }),
      );
    });

    it('should update a user logged successfully with nickName only', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'old nickName',
      };
      const updateUserDto: UpdateUserDto = {
        nickName: 'new nickName',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        createdAt: new Date(),
        transactions: [],
      };
      const userUpdated = {
        ...user,
        nickName: updateUserDto.nickName,
      };

      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spySave = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userUpdated as any);

      // action
      const result = await userService.update(
        updateUserDto,
        tokenPayload as any,
      );

      // assert
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(user.nickName).toBe(updateUserDto.nickName);
      expect(spySave).toHaveBeenCalledWith(user);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.USER_UPDATED,
        }),
      );
    });

    it('should update a user logged successfully with password only', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'nickName',
      };
      const updateUserDto: UpdateUserDto = {
        password: 'new password',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        password: 'old password',
        createdAt: new Date(),
        transactions: [],
      };
      const originalPassword = updateUserDto.password;
      const passwordHash = 'TESTINGHASHPASSWORD123';
      const userUpdated = {
        ...user,
        password: passwordHash,
      };

      // mocks
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyHashPassword = jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue(passwordHash);
      const spySave = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userUpdated as any);

      // action
      const result = await userService.update(
        updateUserDto,
        tokenPayload as any,
      );

      // assert
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyHashPassword).toHaveBeenCalledWith(originalPassword);
      expect(user.password).toBe(passwordHash);
      expect(spySave).toHaveBeenCalledWith(user);
      expect(result).toStrictEqual(
        new ApiResponseDto({ message: ResponseSuccessMessages.USER_UPDATED }),
      );
    });

    it('should throw a BadRequestException when empty datas', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'nickName',
      };
      const updateUserDto: UpdateUserDto = {};
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        createdAt: new Date(),
        transactions: [],
      };

      jest.spyOn(userService, 'findUser').mockResolvedValue(user as any);

      await expect(
        userService.update(updateUserDto, tokenPayload as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException when nickName is equal', async () => {
      const tokenPayload = {
        id: 1,
        nickName: 'nickName',
      };
      const updateUserDto: UpdateUserDto = {
        nickName: 'nickName',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        createdAt: new Date(),
        transactions: [],
      };

      jest.spyOn(userService, 'findUser').mockResolvedValue(user as any);

      await expect(
        userService.update(updateUserDto, tokenPayload as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an InternalServerErrorException for another errors', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'Nickname',
      };
      const updateUserDto: UpdateUserDto = {
        nickName: 'nickName',
      };

      const genericError = new Error();
      jest.spyOn(userService, 'findUser').mockRejectedValue(genericError);

      // assert
      await expect(
        userService.update(updateUserDto, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a user logged successfully', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nick_name: 'Testing',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nick_name,
        createdAt: new Date(),
        transactions: [
          {
            id: 1,
            title: 'Testing',
            amount: 1.95,
            type: 'expense',
            category: 'other',
            createdAt: new Date(),
          },
        ],
      };

      const spyFindUserService = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyUserRepositoryDelete = jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValue(user.id as any);

      // action
      const result = await userService.delete(tokenPayload as any);

      // assert
      expect(spyFindUserService).toHaveBeenCalledWith(tokenPayload);
      expect(spyUserRepositoryDelete).toHaveBeenCalledWith(user.id);
      expect(result).toStrictEqual(
        new ApiResponseDto({ message: ResponseSuccessMessages.USER_DELETED }),
      );
    });

    it('should throw an HttpException', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nick_name: 'Testing',
      };
      const httpError = new NotFoundException();

      jest.spyOn(userService, 'findUser').mockRejectedValue(httpError);

      // assert
      await expect(userService.delete(tokenPayload as any)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw an InternalServerErrorException for another errors', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nick_name: 'Testing',
      };
      const genericError = new Error();

      jest.spyOn(userService, 'findUser').mockRejectedValue(genericError);

      // assert
      await expect(userService.delete(tokenPayload as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
