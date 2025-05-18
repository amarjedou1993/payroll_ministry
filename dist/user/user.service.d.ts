import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RoleService } from '@role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PayrollService } from '@payroll/payroll.service';
export declare class UserService {
    private readonly userRepository;
    private readonly roleService;
    private readonly payrollService;
    constructor(userRepository: Repository<User>, roleService: RoleService, payrollService: PayrollService);
    createUser(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    getAllEmployeeIds(): Promise<string[]>;
    findByUsername(username: string): Promise<User>;
    findByEmployeeId(employeeId: string): Promise<User>;
    findUsers(): Promise<UserResponseDto[]>;
    findAllUsers(page?: number, limit?: number, role?: string, search?: string): Promise<{
        data: UserResponseDto[];
        meta: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    removeUser(id: number): Promise<import("typeorm").DeleteResult>;
    findUserById(id: number): Promise<User>;
    getPayrollsByUserId(userId: number): Promise<import("../payroll/entities/payroll.entity").Payroll[]>;
    private parseExcelFile;
    importUsersFromFile(file: Express.Multer.File): Promise<{
        savedUsers: UserResponseDto[];
        skippedCount: number;
    }>;
}
