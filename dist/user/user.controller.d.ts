import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUsers(req: Request): Promise<UserResponseDto[]>;
    findAll(page?: string, limit?: string, role?: string, search?: string): Promise<{
        data: UserResponseDto[];
        meta: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getUser(id: string): Promise<import("./entities/user.entity").User>;
    updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    removeUser(userId: number): Promise<import("typeorm").DeleteResult>;
    getUserPayrolls(id: string): Promise<import("../payroll/entities/payroll.entity").Payroll[]>;
    importUsersFromFile(file: Express.Multer.File): Promise<{
        message: string;
        data: UserResponseDto[];
    }>;
}
