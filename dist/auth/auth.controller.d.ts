import { AuthService } from './auth.service';
import { Response } from 'express';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UpdateUserDto } from '@user/dto/update-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<import("../user/dto/user-response.dto").UserResponseDto>;
    login(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getAuthStatus(req: any): {
        isAuthenticated: boolean;
        user: {
            id: number;
            username: string;
            roles: {
                name: string;
            }[];
        };
    } | {
        isAuthenticated: boolean;
        user?: undefined;
    };
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("../user/dto/user-response.dto").UserResponseDto>;
    logout(res: Response): Promise<Response<any, Record<string, any>>>;
}
