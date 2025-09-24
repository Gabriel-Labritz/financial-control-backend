import { validate } from 'class-validator';
import { SignInDto } from './sign_in.dto';

describe('SignInDto Validation', () => {
  let signInDto: SignInDto;

  beforeEach(() => {
    signInDto = new SignInDto();
  });

  it('should pass validation with valid datas', async () => {
    signInDto.email = 'testing@teste.com';
    signInDto.password = 'Testing123#';

    const errors = await validate(signInDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with an invalid email format', async () => {
    signInDto.email = 'testing';
    signInDto.password = 'Testing123#';

    const errors = await validate(signInDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation with password missing', async () => {
    signInDto.email = 'testing@teste.com';
    signInDto.password = '';

    const errors = await validate(signInDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
  });
});
