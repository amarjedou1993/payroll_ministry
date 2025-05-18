import { PayrollResponse } from '@payroll/dto/payroll-response.dto';
import { ResponseRoleDto } from '@role/dto/response-role.dto';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: number;
  username: string;
  name: string;

  @Exclude()
  employeeId: string;
  password: string;
  position: string;
  roles: ResponseRoleDto[];
  payrolls: PayrollResponse[];
}
