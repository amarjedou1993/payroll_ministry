import { UploadPayrollDto } from './dto/upload-payroll.dto';
import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
export declare class PayrollService {
    private readonly payrollRepository;
    constructor(payrollRepository: Repository<Payroll>);
    create(payrollDto: UploadPayrollDto): Promise<Payroll>;
    getPayrolls(): Promise<Payroll[]>;
    findPayrolls(page?: number, limit?: number, userId?: string): Promise<{
        data: Payroll[];
        meta: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    findAllPayrolls(page?: number, limit?: number, userId?: string, searchTerm?: string, sortBy?: 'modified' | 'opened'): Promise<{
        data: Payroll[];
        meta: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getAllPayrolls(page: number, limit: number, userId?: number, month?: number, year?: number, searchTerm?: string): Promise<{
        data: Payroll[];
        meta: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getLastFivePayrolls(): Promise<{
        data: Payroll[];
        meta: {
            totalItems: number;
            itemsReturned: number;
        };
    }>;
    remove(id: number): Promise<void>;
    removeByFilename(filename: string): Promise<void>;
    removeByPath(path: string): Promise<void>;
    removeMultiple(ids: number[]): Promise<void>;
    findByEmployeeAndPeriod(employeeId: string, period: string): Promise<Payroll | null>;
}
