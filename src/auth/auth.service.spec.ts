import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../user/entity/User';
import { HashingProtocol } from './hashing/hashing-protocol';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { SignInDto } from './dto/sign_in.dto';
import { randomUUID } from 'crypto';
import { responseUserSuccessMessages } from '../common/enums/success/success_user/response_user_success';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let hashingService: HashingProtocol;
  let jwtService: JwtService;

  const jwtConfiguration: ConfigType<typeof jwtConfig> = {
    secret: 'secret',
    audience: 'http://localhost:5000',
    issuer: 'http://localhost:5000',
    jwtTtl: 3600,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: HashingProtocol,
          useValue: {
            comparePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        { provide: jwtConfig.KEY, useValue: jwtConfiguration },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingProtocol>(HashingProtocol);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should signin user successfully', async () => {
      // arranges
      const signInDto: SignInDto = {
        email: 'john@gmail.com',
        password: 'testingjonhpassword123',
      };
      const user = {
        id: randomUUID(),
        name: 'Jonh',
        password: signInDto.password,
      };
      const token = 'fake-token';

      // mocks
      const spyFindUser = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(user as any);
      const spyComparePassword = jest
        .spyOn(hashingService, 'comparePassword')
        .mockResolvedValue(true);
      const spyJwt = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(token);

      // action
      const result = await authService.signIn(signInDto);

      // asserts
      expect(spyFindUser).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(spyComparePassword).toHaveBeenCalledWith(
        signInDto.password,
        user.password,
      );
      expect(spyJwt).toHaveBeenCalledWith(
        { id: user.id, name: user.name },
        expect.objectContaining({ secret: jwtConfiguration.secret }),
      );
      expect(result).toEqual({
        message: responseUserSuccessMessages.USER_LOGGED,
        accessToken: token,
      });
    });

    it('should throw a NotFoundException when user not found', async () => {
      // arranges
      const signInDto: SignInDto = {
        email: 'john@gmail.com',
        password: 'testingjonhpassword123',
      };

      // mocks
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // action and asserts
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an UnauthorizedException when user password is incorrect', async () => {
      // arranges
      const signInDto: SignInDto = {
        email: 'john@gmail.com',
        password: 'testingjonhpassword123',
      };
      const user = {
        id: randomUUID(),
        name: 'Jonh',
        password: 'passwordHashed',
      };

      // mocks
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(hashingService, 'comparePassword').mockResolvedValue(false);

      // action and asserts
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an HttpException when an http error occurs', async () => {
      // arranges
      const signInDto: SignInDto = {
        email: 'john@gmail.com',
        password: 'testingjonhpassword123',
      };
      const httpError = new NotFoundException();
      // mocks
      jest.spyOn(userRepository, 'findOne').mockRejectedValue(httpError);

      // action and asserts
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw an InternalServerErrorException when an unknown error occurs', async () => {
      // arranges
      const signInDto: SignInDto = {
        email: 'john@gmail.com',
        password: 'testingjonhpassword123',
      };
      const unknownError = new Error();

      // mocks
      jest.spyOn(userRepository, 'findOne').mockRejectedValue(unknownError);

      // action and asserts
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
