import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/User';
import { QueryFailedError, Repository } from 'typeorm';
import { HashingProtocol } from '../auth/hashing/hashing-protocol';
import { CreateUserDto } from './dto/create_user.dto';
import { responseErrorsUserMessages } from '../common/enums/erros/errors_users/response_errors_messages';
import { responseUserSuccessMessages } from '../common/enums/success/success_user/response_user_success';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';

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

      const newUser = this.userRepository.create({
        name,
        email,
        password: passwordHash,
      });
      await this.userRepository.save(newUser);

      return {
        message: responseUserSuccessMessages.USER_CREATED,
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

  async getUser(tokenPayload: TokenPayloadDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: tokenPayload.id },
        select: ['id', 'name', 'email', 'createdAt'],
      });

      if (!user) {
        throw new NotFoundException(responseErrorsUserMessages.USER_NOT_FOUND);
      }

      return {
        message: responseUserSuccessMessages.USER_LOADED,
        user,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsUserMessages.ERROR_LOAD_USER_DATA,
      );
    }
  }
}
