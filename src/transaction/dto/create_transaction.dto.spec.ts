import { validate } from 'class-validator';
import { CreateTransactionDto } from './create_transaction.dto';
import { TransactionTypes } from '../../common/enums/transaction/transaction_types.enum';
import { TransactionCategories } from '../../common/enums/transaction/transaction_categories.enum';

describe('SignInDto Validation', () => {
  let createTransactionDto: CreateTransactionDto;

  beforeEach(() => {
    createTransactionDto = new CreateTransactionDto();
  });

  it('should pass validation with valid datas', async () => {
    createTransactionDto.title = 'Testing';
    createTransactionDto.amount = 2000;
    createTransactionDto.type = TransactionTypes.EXPENSE;
    createTransactionDto.category = TransactionCategories.OTHER;
    createTransactionDto.description = 'testing';

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with title missing', async () => {
    createTransactionDto.title = '';
    createTransactionDto.amount = 2000;
    createTransactionDto.type = TransactionTypes.EXPENSE;
    createTransactionDto.category = TransactionCategories.OTHER;
    createTransactionDto.description = 'testing';

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints).toEqual({
      isNotEmpty: 'O título é obrigatório.',
    });
  });

  it('should fail validation with title max lenght is exceed', async () => {
    createTransactionDto.title = 'a'.repeat(51);
    createTransactionDto.amount = 2000;
    createTransactionDto.type = TransactionTypes.EXPENSE;
    createTransactionDto.category = TransactionCategories.OTHER;
    createTransactionDto.description = 'testing';

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints).toEqual({
      maxLength: 'O título deve conter no máximo 50 caracteres.',
    });
  });

  it('should fail validation with amount missing', async () => {
    createTransactionDto.title = 'testing';
    createTransactionDto.amount = null;
    createTransactionDto.type = TransactionTypes.EXPENSE;
    createTransactionDto.category = TransactionCategories.OTHER;
    createTransactionDto.description = 'testing';

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('amount');
    expect(errors[0].constraints).toEqual({
      isNotEmpty: 'O valor é obrigatório.',
      isNumber: 'O valor deve ser um número.',
      isPositive: 'O valor deve ser positivo.',
    });
  });

  it('should fail validation with amount negative value', async () => {
    createTransactionDto.title = 'testing';
    createTransactionDto.amount = -2000;
    createTransactionDto.type = TransactionTypes.EXPENSE;
    createTransactionDto.category = TransactionCategories.OTHER;
    createTransactionDto.description = 'testing';

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('amount');
    expect(errors[0].constraints).toEqual({
      isPositive: 'O valor deve ser positivo.',
    });
  });

  it('should fail validation with transaction type invalid', async () => {
    createTransactionDto.title = 'testing';
    createTransactionDto.amount = 2000;
    createTransactionDto.type = 'invalid type';
    createTransactionDto.category = TransactionCategories.OTHER;
    createTransactionDto.description = 'testing';

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('type');
    expect(errors[0].constraints).toEqual({
      isEnum: 'Informe o tipo da transação (renda ou despensa).',
    });
  });

  it('should fail validation with transaction category invalid', async () => {
    createTransactionDto.title = 'testing';
    createTransactionDto.amount = 2000;
    createTransactionDto.type = TransactionTypes.EXPENSE;
    createTransactionDto.category = 'invalid category';
    createTransactionDto.description = 'testing';

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('category');
    expect(errors[0].constraints).toEqual({
      isEnum:
        'Informe a categoria da transação (saúde, alimentação, transporte, entreterimento, salário ou outro).',
    });
  });

  it('should fail validation with description max lenght is exceed', async () => {
    createTransactionDto.title = 'testing';
    createTransactionDto.amount = 2000;
    createTransactionDto.type = TransactionTypes.EXPENSE;
    createTransactionDto.category = TransactionCategories.OTHER;
    createTransactionDto.description = 't'.repeat(151);

    const errors = await validate(createTransactionDto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('description');
    expect(errors[0].constraints).toEqual({
      maxLength:
        'A descrição da transação deve conter no máximo 150 caracteres.',
    });
  });
});
