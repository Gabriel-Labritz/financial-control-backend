import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';
import { TokenPayloadParam } from '../common/params/token_payload.param';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import type { Response } from 'express';
import { UpdateUserDto } from './dto/update_user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { responseErrorsUserMessages } from '../common/enums/erros/errors_users/response_errors_messages';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfileUser(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.userService.getUser(tokenPayload);
  }

  @UseGuards(AuthGuard)
  @Patch('update')
  updateUserAccount(
    @Body() updateUserDto: UpdateUserDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userService.update(updateUserDto, tokenPayload);
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  async deleteUserAccount(
    @Res({ passthrough: true }) res: Response,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    const { message } = await this.userService.remove(tokenPayload);
    res.clearCookie('jwt');

    return message;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename(req, file, callback) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException(
              responseErrorsUserMessages.ERROR_INVALID_FILE_FORMAT,
            ),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  @Patch('upload-image')
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userService.updateProfileImage(file, tokenPayload);
  }
}
