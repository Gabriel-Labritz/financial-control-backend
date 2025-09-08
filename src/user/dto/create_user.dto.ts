import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MinLength(3, { message: 'O nome deve conter no mínimo 3 caracteres.' })
  @MaxLength(50, { message: 'O nome deve conter no máximo 50 caracteres.' })
  name: string;

  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  @MaxLength(50, { message: 'O email deve conter no máximo 50 caracteres.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsStrongPassword(
    {
      minLength: 6,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'A senha deve conter no mínimo 6 caracteres, incluindo letra maiúscula, número e caracter especial.',
    },
  )
  password: string;
}
