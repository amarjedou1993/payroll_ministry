import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(
    err: Error | null, // Error from Passport strategy
    user: any, // User object returned by the strategy, or null if authentication failed
    info: { message?: string } | null, // Additional info (e.g., failure message from Passport)
  ): any {
    if (err || !user) {
      console.error('Login Error:', err?.message || info?.message); // Debug log
      throw new UnauthorizedException('Username ou mot de passe invalide.');
    }
    return user;
  }
}
