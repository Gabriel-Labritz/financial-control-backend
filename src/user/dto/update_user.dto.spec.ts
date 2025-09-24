import { validate } from 'class-validator';
import { UpdateUserDto } from './update_user.dto';

describe('UpdateUser Validation', () => {
  let updateUserDto: UpdateUserDto;

  beforeEach(() => {
    updateUserDto = new UpdateUserDto();
  });

  it('should pass validation with no datas provided', async () => {
    const errors = await validate(updateUserDto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with only a valid name provided', async () => {
    updateUserDto.name = 'testing';

    const errors = await validate(updateUserDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with an invalid email format', async () => {
    updateUserDto.email = 'testing@';

    const errors = await validate(updateUserDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });
});
