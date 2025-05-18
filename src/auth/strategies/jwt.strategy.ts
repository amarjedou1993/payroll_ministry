import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '@user/user.service';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: number;
  username: string;
  roles: { name: string }[];
};

// For Http-only cookies
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.jwt,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    // if (!payload) throw new UnauthorizedException();
    // return payload;
    // if (!payload.sub || !payload.username || !payload.roles) {
    //   throw new UnauthorizedException('Invalid JWT payload');
    // }

    // return {
    //   id: payload.sub,
    //   username: payload.username,
    //   roles: payload.roles,
    // };

    const user = await this.userService.findUserById(payload.sub);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }
}
