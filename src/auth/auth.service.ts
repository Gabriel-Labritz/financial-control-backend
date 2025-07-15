import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingProtocol } from './hashing/hashing.protocol';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { ResponseSuccessMessages } from 'src/common/enum/response-success-messages.enum';
import { ResponseErrorsMessages } from 'src/common/enum/response-errors-messages.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingProtocol,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(ResponseErrorsMessages.USER_NOT_FOUND);
    }

    const passwordIsValid = await this.hashingService.comparePassword(
      password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        ResponseErrorsMessages.INCORRECT_PASSWORD,
      );
    }

    const token = await this.jwtSignAsync(user);

    return {
      message: ResponseSuccessMessages.USER_AUTHENTICATED,
      accessToken: token,
    };
  }

  private async jwtSignAsync(user: User) {
    return await this.jwtService.signAsync(
      {
        id: user.id,
        nick_name: user.nickName,
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
