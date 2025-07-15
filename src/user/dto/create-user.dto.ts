import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'O apelido deve ser uma string.' })
  @IsNotEmpty({ message: 'O apelido é obrigatório.' })
  @MinLength(3, { message: 'O apelido deve conter no mínimo 3 caracteres.' })
  @MaxLength(50, { message: 'O apelido deve conter no máximo 50 caracteres.' })
  nickName: string;

  @IsEmail()
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  @MaxLength(50, { message: 'O email deve conter no máximo 50 caracteres.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsStrongPassword(
    {
      minLength: 6,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 0,
    },
    {
      message:
        'A senha deve conter no mínimo 6 caracteres, incluindo pelo menos 1 número e 1 caracter especial.',
    },
  )
  password: string;
}
