import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  findAll() {
    return this.userService.findAll();
  }
}
