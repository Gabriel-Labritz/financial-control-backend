import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../../auth/config/jwt.config';
import { responseErrorsUserMessages } from '../enums/erros/errors_users/response_errors_messages';

export interface TokenPayload {
  id: string;
  name: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(req);

    if (!token) {
      throw new UnauthorizedException(
        responseErrorsUserMessages.NOT_AUTHENTICATED,
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      req['user'] = payload;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException(err.message);
      }

      if (err instanceof HttpException) {
        throw err;
      }
    }

    return true;
  }

  private extractTokenFromCookie(req: Request): string | undefined {
    if (typeof req.cookies?.jwt === 'string') return req.cookies?.jwt;
    return undefined;
  }
}
