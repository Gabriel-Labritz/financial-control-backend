import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ResponseErrorsMessages } from '../enum/response-errors-messages.enum';

export class ParseIntIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }

    const parsedValue = Number(value);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      throw new BadRequestException(ResponseErrorsMessages.INVALID_ID);
    }

    return parsedValue;
  }
}
