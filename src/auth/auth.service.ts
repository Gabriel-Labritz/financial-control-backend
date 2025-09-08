import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign_in.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/User';
import { Repository } from 'typeorm';
import { HashingProtocol } from './hashing/hashing-protocol';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { responseErrorsUserMessages } from 'src/common/enums/erros/errors_users/response_errors_messages';
import { responseUserSuccessMessages } from 'src/common/enums/success/success_user/response_user_success';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingProtocol,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException(responseErrorsUserMessages.USER_NOT_FOUND);
      }

      const passwordMatch = await this.hashingService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        throw new UnauthorizedException(
          responseErrorsUserMessages.INCORRECT_PASSWORD,
        );
      }

      const accessToken = await this.jwtSignAsync(user);

      return {
        message: responseUserSuccessMessages.USER_LOGGED,
        accessToken,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseErrorsUserMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async jwtSignAsync(user: User) {
    return await this.jwtService.signAsync(
      {
        id: user.id,
        name: user.name,
      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.jwtTtl,
      },
    );
  }
}
