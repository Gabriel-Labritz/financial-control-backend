import {
  BadRequestException,
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
import { UpdateUserDto } from './dto/update_user.dto';
import { join } from 'path';
import { promises as fsPromises } from 'fs';

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

  async update(updateUserDto: UpdateUserDto, tokenPayload: TokenPayloadDto) {
    try {
      const updatedData = { ...updateUserDto };

      if (Object.keys(updateUserDto).length === 0) {
        throw new BadRequestException(
          responseErrorsUserMessages.ERROR_EMPTY_DATA_UPDATE,
        );
      }

      const user = await this.userRepository.findOne({
        where: { id: tokenPayload.id },
      });

      if (!user) {
        throw new NotFoundException(responseErrorsUserMessages.USER_NOT_FOUND);
      }

      if (updatedData.password) {
        updatedData.password = await this.hashingService.hashPassword(
          updatedData.password,
        );
      }

      const userUpdated = Object.assign(user, updatedData);
      await this.userRepository.save(userUpdated);

      return {
        message: responseUserSuccessMessages.USER_UPDATED,
        user: {
          id: userUpdated.id,
          name: userUpdated.name,
          email: userUpdated.email,
          createdAt: userUpdated.createdAt,
          updatedAt: userUpdated.updatedAt,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsUserMessages.ERROR_UPDATE_USER,
      );
    }
  }

  async remove(tokenPayload: TokenPayloadDto) {
    try {
      const { user } = await this.getUser(tokenPayload);
      await this.userRepository.delete(user.id);

      return {
        message: responseUserSuccessMessages.USER_DELETED,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsUserMessages.ERROR_DELETE_USER,
      );
    }
  }

  async updateProfileImage(
    file: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    try {
      if (!file) {
        throw new BadRequestException(
          responseErrorsUserMessages.ERROR_IMAGE_EMPTY,
        );
      }

      const user = await this.userRepository.findOne({
        where: { id: tokenPayload.id },
      });

      if (!user) {
        throw new NotFoundException(responseErrorsUserMessages.USER_NOT_FOUND);
      }

      if (user.profileImageUrl) {
        const oldUserImagePath = join(process.cwd(), user.profileImageUrl);
        try {
          await fsPromises.unlink(oldUserImagePath);
        } catch (err) {
          console.error(`Erro ao excluir o arquivo antigo: ${err}`);
        }
      }

      user.profileImageUrl = file.path;

      await this.userRepository.save(user);

      return {
        message: responseUserSuccessMessages.IMAGE_UPDATED,
        user: {
          id: user.id,
          name: user.name,
          profileImageUrl: user.profileImageUrl,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsUserMessages.ERROR_IMAGE_SEND,
      );
    }
  }
}
