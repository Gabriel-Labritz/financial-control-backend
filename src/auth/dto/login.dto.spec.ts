import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';
import { validate } from 'class-validator';

describe('LoginDto', () => {
  it('should validate dto when all fields are correct', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'validemail@email.com',
      password: 'Strongpassword123#',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('Email', () => {
    it('should fail if email is missing', async () => {
      const dto = plainToInstance(LoginDto, {
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if is not email', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'invalidemail',
        password: 'Strongpassword123#',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('Password', () => {
    it('should fail if password is missing', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'validemail@email.com',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if password is not a string', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'validemail@email.com',
        password: 123456,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
