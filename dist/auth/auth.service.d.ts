import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UpdateUserDto } from '@user/dto/update-user.dto';
import { UserResponseDto } from '@user/dto/user-response.dto';
import { UserService } from '@user/user.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<import("../user/entities/user.entity").User>;
    login(user: Partial<UserResponseDto>): Promise<{
        id: number;
        username: string;
        access_token: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    updateProfile(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
}
