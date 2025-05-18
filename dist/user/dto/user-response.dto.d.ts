import { PayrollResponse } from '@payroll/dto/payroll-response.dto';
import { ResponseRoleDto } from '@role/dto/response-role.dto';
export declare class UserResponseDto {
    id: number;
    username: string;
    name: string;
    employeeId: string;
    password: string;
    position: string;
    roles: ResponseRoleDto[];
    payrolls: PayrollResponse[];
}
