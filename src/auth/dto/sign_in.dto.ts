import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password: string;
}
