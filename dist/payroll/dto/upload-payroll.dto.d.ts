import { User } from '@user/entities/user.entity';
export declare class UploadPayrollDto {
    filename: string;
    path: string;
    period?: string;
    user?: User;
}
