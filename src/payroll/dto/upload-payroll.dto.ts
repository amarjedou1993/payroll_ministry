import { User } from '@user/entities/user.entity';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadPayrollDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  period?: string;

  @IsOptional()
  user?: User;
}
