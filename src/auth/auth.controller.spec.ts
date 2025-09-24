import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { responseUserSuccessMessages } from '../common/enums/success/success_user/response_user_success';
import { SignInDto } from './dto/sign_in.dto';
import { NotFoundException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const jwtConfiguration: ConfigType<typeof jwtConfig> = {
    secret: 'secret',
    audience: 'http://localhost:5000',
    issuer: 'http://localhost:5000',
    jwtTtl: 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
          },
        },
        { provide: jwtConfig.KEY, useValue: jwtConfiguration },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService.signIn with signDTO, set res cookie cookie and return success message', async () => {
      // asserts
      const signInDto: SignInDto = {
        email: 'testing@test.com',
        password: 'password123@',
      };
      const expectedReturnSignInService = {
        message: responseUserSuccessMessages.USER_LOGGED,
        accessToken: 'fake access token',
      };

      // mocks
      const spySignInService = jest
        .spyOn(authService, 'signIn')
        .mockResolvedValue(expectedReturnSignInService as any);
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as { cookie: jest.Mock };

      // action
      const result = await controller.signIn(signInDto, mockResponse as any);

      // asserts
      expect(spySignInService).toHaveBeenCalledWith(signInDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'jwt',
        expectedReturnSignInService.accessToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: expect.any(Number),
          path: '/',
        },
      );
      expect(result).toEqual({
        message: responseUserSuccessMessages.USER_LOGGED,
      });
    });

    it('should throw HttpException when authService.signIn throw an http error', async () => {
      // asserts
      const signInDto: SignInDto = {
        email: 'testing@test.com',
        password: 'password123@',
      };
      const errorMessage = 'user not found';

      // mocks
      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new NotFoundException(errorMessage));
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as { cookie: jest.Mock };

      // action and asserts
      await expect(
        controller.signIn(signInDto, mockResponse as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.signIn(signInDto, mockResponse as any),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success message', () => {
      // mocks
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as { clearCookie: jest.Mock };

      // action
      const result = controller.logOut(mockResponse as any);

      // asserts
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      expect(result).toEqual({
        message: responseUserSuccessMessages.USER_LOGOUT,
      });
    });
  });
});
