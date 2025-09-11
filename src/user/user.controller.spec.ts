import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';
import { ConflictException } from '@nestjs/common';

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
          },
        },
      ],
    }).compile();

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

    it('should throw an HttpException when userService throws an error', async () => {
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
});
