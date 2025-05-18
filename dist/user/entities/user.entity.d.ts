import { BaseEntity } from '@common/entity/base.entity';
import { Payroll } from '@payroll/entities/payroll.entity';
import { Role } from '@role/entities/role.entity';
export declare class User extends BaseEntity {
    username: string;
    password: string;
    employeeId: string;
    name: string;
    position: string;
    roles: Role[];
    payrolls: Payroll[];
}
