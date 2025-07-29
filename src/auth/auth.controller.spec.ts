import { AuthController } from './auth.controller';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    signIn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.signIn with correct data', async () => {
      // arrange
      const loginDto: LoginDto = {
        email: 'testing@test.com',
        password: 'passwordhere!',
      };
      const fakeResponse = { message: 'success' };

      // mocks
      const signIn = authService.signIn.mockResolvedValue(fakeResponse);

      // action
      const result = await controller.login(loginDto);

      // assert
      expect(signIn).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(fakeResponse);
    });
  });
});
