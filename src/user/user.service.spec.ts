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
} from '@nestjs/common';

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
    it('should create a user successfully', async () => {
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

    it('should throw InternalServerException when a unknown errors occurs', async () => {
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
});
