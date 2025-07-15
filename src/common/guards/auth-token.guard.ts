import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from 'src/auth/config/jwt.config';
import { TokenPayloadInterface } from './token-payload.interface';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.getTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    try {
      const userPayload =
        await this.jwtService.verifyAsync<TokenPayloadInterface>(token, {
          secret: this.jwtConfiguration.secret,
        });

      req['user'] = userPayload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }

    return true;
  }

  private getTokenFromHeader(req: Request): string | null {
    const authorization = req.headers?.authorization;

    if (!authorization) {
      return null;
    }

    const token = authorization?.split(' ')[1];
    return token;
  }
}
