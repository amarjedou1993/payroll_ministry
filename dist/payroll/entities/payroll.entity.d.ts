import { BaseEntity } from '@common/entity/base.entity';
import { User } from '@user/entities/user.entity';
export declare class Payroll extends BaseEntity {
    filename: string;
    path: string;
    period: string;
    user: User;
}
