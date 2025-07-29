import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString({ message: 'A senha deve ser uma string' })
  password: string;
}
