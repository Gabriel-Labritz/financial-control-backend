import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';
import { TokenPayloadParam } from '../common/params/token_payload.param';
import { TokenPayloadDto } from '../auth/dto/token_payload.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import type { Response } from 'express';

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
  updateUserAccount() {
    return this.userService.update();
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
}
