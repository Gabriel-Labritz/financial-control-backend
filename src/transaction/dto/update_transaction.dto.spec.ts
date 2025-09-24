import { UpdateTransactionDto } from './update_transaction.dto';
import { validate } from 'class-validator';

describe('UpdateTransaction Validation', () => {
  let updateTransactionDto: UpdateTransactionDto;

  beforeEach(() => {
    updateTransactionDto = new UpdateTransactionDto();
  });

  it('should pass validation with no datas provided', async () => {
    const errors = await validate(updateTransactionDto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with only a valid title provided', async () => {
    updateTransactionDto.title = 'testing';

    const errors = await validate(updateTransactionDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with title empty', async () => {
    updateTransactionDto.title = '';

    const errors = await validate(updateTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints).toEqual({
      isNotEmpty: 'O título é obrigatório.',
    });
  });
});
