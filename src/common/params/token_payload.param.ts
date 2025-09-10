import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TokenPayload } from '../guards/auth.guard';

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    return req['user'] as TokenPayload;
  },
);
