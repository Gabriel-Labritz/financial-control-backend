import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { HashingProtocol } from './hashing/hashing.protocol';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { LoginDto } from './dto/login.dto';

import { ResponseSuccessMessages } from 'src/common/enum/response-success-messages.enum';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let hashingService: HashingProtocol;
  let jwtService: JwtService;

  const jwtConfiguration: ConfigType<typeof jwtConfig> = {
    secret: 'secret here!',
    audience: 'http://localhost:3000',
    issuer: 'http://localhost:3000',
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
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfiguration,
        },
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
    it('should login user successfully and return an access token', async () => {
      // arrange
      const loginDto: LoginDto = {
        email: 'testing@test.com',
        password: 'mypassword',
      };
      const user = {
        id: 1,
        nickName: 'testing',
        password: 'hashed',
      };
      const token = 'fake-access-token';

      // mocks
      const spyFindUser = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(user as any);
      const spyComparePassword = jest
        .spyOn(hashingService, 'comparePassword')
        .mockResolvedValue(true);
      const spyJwtSignAsync = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(token);

      // action
      const result = await authService.signIn(loginDto);

      // asserts
      expect(spyFindUser).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(spyComparePassword).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(spyJwtSignAsync).toHaveBeenCalledWith(
        {
          id: user.id,
          nick_name: user.nickName,
        },
        expect.objectContaining({
          secret: jwtConfiguration.secret,
        }),
      );
      expect(result).toStrictEqual({
        message: ResponseSuccessMessages.USER_AUTHENTICATED,
        accessToken: token,
      });
    });

    it('should throw a NotFoundException when user not exists', async () => {
      // arrange
      const loginDto: LoginDto = {
        email: 'testing@test.com',
        password: 'mypassword',
      };

      // mocks
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // asserts
      await expect(authService.signIn(loginDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a UnauthorizedException when incorrect user password', async () => {
      // arrange
      const loginDto: LoginDto = {
        email: 'testing@test.com',
        password: 'mypassword',
      };
      const user = {
        id: 1,
        nickName: 'testing',
        password: 'hashed',
      };

      // mocks
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(hashingService, 'comparePassword').mockResolvedValue(false);

      // asserts
      await expect(authService.signIn(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
