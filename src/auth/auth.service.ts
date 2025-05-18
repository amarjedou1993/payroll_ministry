import { comparePassword } from '@common/utils/crypto.util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UpdateUserDto } from '@user/dto/update-user.dto';
import { UserResponseDto } from '@user/dto/user-response.dto';
import { UserService } from '@user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const isCorrectPassword = await comparePassword(password, user.password);

    if (isCorrectPassword) {
      return user;
    }

    return null;
  }

  async login(user: Partial<UserResponseDto>) {
    const { id, username, roles } = user;
    const accessTocken = this.jwtService.sign({
      sub: id,
      username: username,
      roles: roles,
    });
    return {
      id,
      username,
      access_token: accessTocken,
    };
  }

  async register(createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
