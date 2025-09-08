import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/User';
import { QueryFailedError, Repository } from 'typeorm';
import { HashingProtocol } from 'src/auth/hashing/hashing-protocol';
import { CreateUserDto } from './dto/create_user.dto';
import { responseErrorsUserMessages } from 'src/common/enums/erros/errors_users/response_errors_messages';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingProtocol,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    try {
      const passwordHash = await this.hashingService.hashPassword(password);

      const userData = {
        name,
        email,
        password: passwordHash,
      } as CreateUserDto;

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);

      return {
        message: 'Sua conta foi criada com sucesso!',
        userData,
      };
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        'code' in err &&
        err.code === '23505'
      ) {
        throw new ConflictException(
          responseErrorsUserMessages.USER_ALREADY_EXISTS,
        );
      }

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsUserMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
