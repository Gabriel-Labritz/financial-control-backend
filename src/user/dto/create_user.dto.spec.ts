import { validate } from 'class-validator';
import { CreateUserDto } from './create_user.dto';

describe('CreateUser Validation', () => {
  let createUserDto: CreateUserDto;

  beforeEach(() => {
    createUserDto = new CreateUserDto();
  });

  it('should pass validation with valid datas', async () => {
    createUserDto.name = 'test';
    createUserDto.email = 'testing@test.com';
    createUserDto.password = 'Testing123!';

    const errors = await validate(createUserDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with name missing', async () => {
    createUserDto.name = '';
    createUserDto.email = 'testing@test.com';
    createUserDto.password = 'Testing123!';

    const errors = await validate(createUserDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation with email missing', async () => {
    createUserDto.name = 'test';
    createUserDto.email = '';
    createUserDto.password = 'Testing123!';

    const errors = await validate(createUserDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation with an invalid email format', async () => {
    createUserDto.name = 'test';
    createUserDto.email = 'testing@';
    createUserDto.password = 'Testing123!';

    const errors = await validate(createUserDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation with password missing', async () => {
    createUserDto.name = 'test';
    createUserDto.email = 'testing@test.com';
    createUserDto.password = '';

    const errors = await validate(createUserDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
  });

  it('should fail validation with a password too short', async () => {
    createUserDto.name = 'test';
    createUserDto.email = 'testing@test.com';
    createUserDto.password = '12345';

    const errors = await validate(createUserDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
  });

  it('should fail validation with a weak password', async () => {
    createUserDto.name = 'test';
    createUserDto.email = 'testing@test.com';
    createUserDto.password = '123456';

    const errors = await validate(createUserDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
  });
});
