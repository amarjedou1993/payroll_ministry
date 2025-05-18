import { JwtPayload } from '@auth/strategies/jwt.strategy';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/user.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.jwt;

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      console.log('Decoded Payload:', payload);

      // *** This is the CRUCIAL change: Fetch the user from the database ***
      const user = await this.userService.findUserById(payload.sub); // Assuming 'sub' is the user ID

      if (!user) {
        throw new UnauthorizedException('User not found.'); // Handle the case where the user is not in the database
      }
      // console.log('User retrieved from database:', user); // Log the full user object

      req.user = user; // Set req.user to the FULL user object
      return true;
    } catch (error) {
      console.error('JWT Verification or User Retrieval Error:', error);
      throw new UnauthorizedException(
        'Invalid or expired token or user not found',
      ); // More descriptive message
    }
  }
}
