import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TokenPayloadInterface } from '../guards/token-payload.interface';

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    return req['user'] as TokenPayloadInterface;
  },
);
