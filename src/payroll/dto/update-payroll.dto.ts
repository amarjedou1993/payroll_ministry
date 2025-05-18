import { PartialType } from '@nestjs/mapped-types';
import { UploadPayrollDto } from './upload-payroll.dto';

export class UpdatePayrollDto extends PartialType(UploadPayrollDto) {}
