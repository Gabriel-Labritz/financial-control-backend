import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entity/User';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingProtocol } from '../auth/hashing/hashing-protocol';
import { CreateUserDto } from './dto/create_user.dto';
import { responseUserSuccessMessages } from '../common/enums/success/success_user/response_user_success';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

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
    it('should create an user successfully', async () => {
      // arranges
      const createUserDto: CreateUserDto = {
        name: 'Jonh',
        email: 'john@gmail.com',
        password: 'Testin!123',
      };
      const passwordHash = 'PasswordHashOfJonh';
      const expectedNewUser = {
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
      };

      // mocks
      const spyPasswordHash = jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue(passwordHash);
      const spyCreateUser = jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(expectedNewUser as any);
      const spySaveUser = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(expectedNewUser as any);

      // action
      const result = await userService.create(createUserDto);

      // asserts
      expect(spyPasswordHash).toHaveBeenCalledWith(createUserDto.password);
      expect(spyCreateUser).toHaveBeenCalledWith(expectedNewUser);
      expect(spySaveUser).toHaveBeenCalledWith(expectedNewUser);
      expect(result).toEqual({
        message: responseUserSuccessMessages.USER_CREATED,
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      // arranges
      const createUserDto: CreateUserDto = {
        name: 'Jonh',
        email: 'john@gmail.com',
        password: 'Testin!123',
      };
      const errorSimulated = new QueryFailedError('', [], new Error());
      errorSimulated['code'] = '23505';

      // mocks
      jest.spyOn(userRepository, 'save').mockRejectedValue(errorSimulated);

      // action and assert
      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw HttpException when a http errors occurs', async () => {
      // arranges
      const createUserDto: CreateUserDto = {
        name: 'Jonh',
        email: 'john@gmail.com',
        password: 'Testin!123',
      };
      const httpError = new BadRequestException();

      // mocks
      jest.spyOn(userRepository, 'save').mockRejectedValue(httpError);

      // action and assert
      await expect(userService.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw InternalServerException when an unknown error occurs', async () => {
      // arranges
      const createUserDto: CreateUserDto = {
        name: 'Jonh',
        email: 'john@gmail.com',
        password: 'Testin!123',
      };
      const unknownError = new Error();

      // mocks
      jest.spyOn(userRepository, 'save').mockRejectedValue(unknownError);

      // action and assert
      await expect(userService.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getUser', () => {
    it('should return datas from user logged in', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const user = {
        id: tokenPayload.id,
        name: tokenPayload.name,
        email: 'jonh@gmail.com',
        createdAt: new Date(),
      };

      // mocks
      const spyFindOne = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(user as any);

      // action
      const result = await userService.getUser(tokenPayload as any);

      // asserts
      expect(spyFindOne).toHaveBeenCalledWith({
        where: { id: tokenPayload.id },
        select: ['id', 'name', 'email', 'createdAt'],
      });
      expect(result).toEqual({
        message: responseUserSuccessMessages.USER_LOADED,
        user,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };

      // mocks
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // action and asserts
      await expect(userService.getUser(tokenPayload as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw HttpException when a http error occurs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const httpError = new NotFoundException();

      // mocks
      jest.spyOn(userRepository, 'findOne').mockRejectedValue(httpError);

      // action and asserts
      await expect(userService.getUser(tokenPayload as any)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw InternalServerErrorException when an unknown error occurs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const unknownError = new Error();

      // mocks
      jest.spyOn(userRepository, 'findOne').mockRejectedValue(unknownError);

      // action and asserts
      await expect(userService.getUser(tokenPayload as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete user logged in account', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const user = {
        id: tokenPayload.id,
        name: tokenPayload.name,
        email: 'jonh@gmail.com',
        createdAt: new Date(),
      };
      const expectedReturnGetUser = {
        message: responseUserSuccessMessages.USER_LOADED,
        user,
      };

      // mocks
      const spyGetUser = jest
        .spyOn(userService, 'getUser')
        .mockResolvedValue(expectedReturnGetUser as any);
      const spyDelete = jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      // action
      const result = await userService.remove(tokenPayload as any);

      // asserts
      expect(spyGetUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyDelete).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({
        message: responseUserSuccessMessages.USER_DELETED,
      });
    });

    it('should throw HttpException when a http error occurs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const httpError = new NotFoundException();

      // mocks
      jest.spyOn(userService, 'getUser').mockRejectedValue(httpError);

      // action and asserts
      await expect(userService.remove(tokenPayload as any)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw InternalServerErrorException when an unknown error occurs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const unknownError = new Error();

      // mocks
      jest.spyOn(userService, 'getUser').mockRejectedValue(unknownError);

      // action and asserts
      await expect(userService.remove(tokenPayload as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
