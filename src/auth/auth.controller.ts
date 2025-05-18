import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Response } from 'express';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { Private } from '@common/decorator/private.decorator';
import { UpdateUserDto } from '@user/dto/update-user.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtPayload } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto.roles);
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: any, @Res() res: Response) {
    const { access_token } = await this.authService.login(req.user);
    const sameSiteValue =
      process.env.NODE_ENV === 'production' ? 'strict' : 'lax'; // Or 'none' with Secure if needed

    res.cookie('jwt', access_token, {
      httpOnly: true, // Prevent Javascript access
      // secure: false,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: sameSiteValue, // CSFR protectionn
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });

    return res.json({ message: 'Logged in successfully' });
  }

  @Get('status')
  @UseGuards(JwtAuthGuard) // Optional: Protect the /status endpoint too
  getAuthStatus(@Req() req: any) {
    // Type the req parameter
    if (req.user) {
      const user = req.user as JwtPayload; // Type assertion for req.user

      return {
        isAuthenticated: true,
        user: {
          id: user.sub, // Access user ID from the payload
          username: user.username,
          roles: user.roles, // Access user roles from the payload
        },
      };
    } else {
      return { isAuthenticated: false };
    }
  }

  @Get('profile')
  @Private()
  async getProfile(@Req() req: any) {
    if (!req.user) throw new UnauthorizedException();
    return req.user; // Return authenticated user data
  }

  @Patch('profile')
  @Private()
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateProfile(req.user?.username, updateUserDto);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
    });

    return res.json({ message: 'Logged out successfully' });
  }
}
