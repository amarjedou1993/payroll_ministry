import { Role } from '@role/enum/role.enum';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(5, 25, { message: 'Username should be between 5 and 25 Chararcters' })
  username: string;

  @IsNotEmpty()
  @Length(6, 8, { message: 'EmployeeId between 6-8 Characters' })
  employeeId: string;

  @IsNotEmpty()
  @Length(8, 30, { message: 'Password must be between 8-30 Characters' })
  password: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(Role, { each: true, message: 'Each role must be valid' })
  roles: string[];
}
