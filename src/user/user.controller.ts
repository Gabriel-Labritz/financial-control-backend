import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthTokenGuard } from 'src/common/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/common/param/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get('profile')
  profile(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.userService.findUser(tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch('update')
  update(
    @Body() updateUserDto: UpdateUserDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userService.update(updateUserDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete('delete-account')
  delete(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.userService.delete(tokenPayload);
  }
}
