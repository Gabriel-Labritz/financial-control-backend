import { Body, Controller, HttpCode, Inject, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign_in.dto';
import type { Response } from 'express';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { responseUserSuccessMessages } from 'src/common/enums/success/success_user/response_user_success';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { message, accessToken } = await this.authService.signIn(signInDto);
    const cookieMaxAge = this.jwtConfiguration.jwtTtl * 1000;

    // define cookie httpOnly
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return { message };
  }

  @Post('logout')
  @HttpCode(200)
  logOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return {
      message: responseUserSuccessMessages.USER_LOGOUT,
    };
  }
}
