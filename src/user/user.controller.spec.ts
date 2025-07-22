import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  const userService = {
    create: jest.fn(),
    findUser: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController(userService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call userService.create with correct data', async () => {
    // arrange
    const createUserDto: CreateUserDto = {
      nickName: 'testing',
      email: 'testing@test.com',
      password: 'testing123',
    };
    const fakeResponse = { message: 'success' };

    const userCreate = userService.create.mockResolvedValue(fakeResponse);

    // action
    const result = await controller.register(createUserDto);

    // assert
    expect(userCreate).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(fakeResponse);
  });

  it('should call userService.findUser with correct data', async () => {
    // arrange
    const tokenPayload = {
      id: 1,
      nickName: 'Testing',
    };
    const fakeResponse = { message: 'success' };

    const findUser = userService.findUser.mockResolvedValue(fakeResponse);

    // action
    const result = await controller.profile(tokenPayload as any);

    // assert
    expect(findUser).toHaveBeenCalledWith(tokenPayload);
    expect(result).toEqual(fakeResponse);
  });

  it('should call userService.update with correct data', async () => {
    // arrange
    const tokenPayload = {
      id: 1,
      nickName: 'Testing',
    };
    const updateUserDto: UpdateUserDto = {
      nickName: 'Testing update',
    };
    const fakeResponse = { message: 'success' };

    const updateUser = userService.update.mockResolvedValue(fakeResponse);

    // action
    const result = await controller.update(updateUserDto, tokenPayload as any);

    // assert
    expect(updateUser).toHaveBeenCalledWith(updateUserDto, tokenPayload);
    expect(result).toEqual(fakeResponse);
  });

  it('should call userService.delete with correct data', async () => {
    // arrange
    const tokenPayload = {
      id: 1,
      nickName: 'Testing',
    };
    const fakeResponse = { message: 'success' };

    const deleteUser = userService.delete.mockResolvedValue(fakeResponse);

    // action
    const result = await controller.delete(tokenPayload as any);

    // assert
    expect(deleteUser).toHaveBeenCalledWith(tokenPayload);
    expect(result).toEqual(fakeResponse);
  });
});
