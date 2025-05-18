import { BaseEntity } from '@common/entity/base.entity';
import { User } from '@user/entities/user.entity';
export declare class Role extends BaseEntity {
    name: string;
    users: User[];
}
