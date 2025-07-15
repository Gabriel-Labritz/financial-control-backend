import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { HashingProtocol } from 'src/auth/hashing/hashing.protocol';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseSuccessMessages } from 'src/common/enum/response-success-messages.enum';
import { ResponseErrorsMessages } from 'src/common/enum/response-errors-messages.enum';
import { ApiResponseDto } from '../common/dtos/api-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingProtocol,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { nickName, email, password } = createUserDto;

    try {
      const passwordHash = await this.hashingService.hashPassword(password);

      const userData = {
        nickName,
        email,
        password: passwordHash,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);

      return new ApiResponseDto<User>({
        message: ResponseSuccessMessages.USER_CREATED,
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          ResponseErrorsMessages.USER_EMAIL_ALREADY_EXISTS,
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_USER_CREATED,
      );
    }
  }

  async findUser(tokenPayload: TokenPayloadDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: tokenPayload.id },
        relations: ['transactions'],
        select: ['id', 'nickName', 'createdAt', 'transactions'],
      });

      if (!user) {
        throw new NotFoundException(ResponseErrorsMessages.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_LOAD_USER,
      );
    }
  }

  async update(updateUserDto: UpdateUserDto, tokenPayload: TokenPayloadDto) {
    try {
      const user = await this.findUser(tokenPayload);

      // verifica se nenhum dos campos foi enviado
      if (!updateUserDto.nickName && !updateUserDto.password) {
        throw new BadRequestException(
          ResponseErrorsMessages.USER_DATA_UPDATE_EMPTY,
        );
      }

      if (
        updateUserDto.nickName &&
        updateUserDto.nickName.toLowerCase() === user.nickName.toLowerCase()
      ) {
        throw new BadRequestException(
          ResponseErrorsMessages.USER_NICKNAME_IS_EQUAL,
        );
      }

      // se o usuário enviar uma senha para atualizar cria um novo hash
      if (updateUserDto?.password) {
        const passwordHash = await this.hashingService.hashPassword(
          updateUserDto.password,
        );
        user.password = passwordHash;
        delete updateUserDto.password;
      }

      // atualizar os dados recebidos pelo dto (nesse ponto pode ser só nickName, pois password já foi tratada separadamente)
      Object.assign(user, updateUserDto);
      await this.userRepository.save(user);

      return new ApiResponseDto<User>({
        message: ResponseSuccessMessages.USER_UPDATED,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_UPDATED_USER,
      );
    }
  }

  async delete(tokenPayload: TokenPayloadDto) {
    try {
      const user = await this.findUser(tokenPayload);
      await this.userRepository.delete(user.id);

      return new ApiResponseDto<User>({
        message: ResponseSuccessMessages.USER_DELETED,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_DELETED_USER,
      );
    }
  }
}
