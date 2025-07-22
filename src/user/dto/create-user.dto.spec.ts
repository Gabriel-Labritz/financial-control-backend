import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { validate } from 'class-validator';

describe('CreateUserDto', () => {
  it('should validate dto when all fields are correct', async () => {
    const dto = plainToInstance(CreateUserDto, {
      nickName: 'ValidNick',
      email: 'validemail@email.com',
      password: 'Strongpassword123#',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('NickName', () => {
    it('should fail dto when nickName is missing', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: '',
        email: 'validemail@email.com',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('nickName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail dto when nickName is not a string', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 123,
        email: 'validemail@email.com',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('nickName');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail dto when nickName is too short', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'ab',
        email: 'validemail@email.com',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('nickName');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail dto when nickName exceeds max length', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'a'.repeat(51),
        email: 'validemail@email.com',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('nickName');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('Email', () => {
    it('should fail dto when email is missing', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'testing',
        email: '',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail dto when email is not a email', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'testing',
        email: 'testingnotemail@123',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail dto when email exceeds max length', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'testing',
        email: 'a'.repeat(51) + '@test.com',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('Password', () => {
    it('should fail dto when password is missing', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'testing',
        email: 'testing@test.com',
        password: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail dto when password is not a string', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'testing',
        email: 'testing@test.com',
        password: 1234,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail dto when password is not a strong password', async () => {
      const dto = plainToInstance(CreateUserDto, {
        nickName: 'testing',
        email: 'testing@test.com',
        password: '123456',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isStrongPassword');
    });
  });
});
