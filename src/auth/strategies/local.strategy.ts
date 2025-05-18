import { AuthService } from '@auth/auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
    });
  }

  async validate(username: string, password: string) {
    try {
      const user = await this.authService.validateUser(username, password);

      if (!user) {
        throw new UnauthorizedException(
          'Invalid credentials. Please try again',
        );
      }
      return user;
    } catch (error) {
      console.error(
        `Login attempt failed for user: ${username}`,
        error.message,
      );
      throw new UnauthorizedException(
        'Login failed. Please check your credentials.',
      );
    }
  }
}
