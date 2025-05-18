import { PayrollService } from './payroll.service';
import { UserService } from '@user/user.service';
import { PdfService } from 'src/pdf/pdf.service';
export declare class PayrollController {
    private readonly payrollService;
    private readonly userService;
    private readonly pdfService;
    private extractedDate;
    constructor(payrollService: PayrollService, userService: UserService, pdfService: PdfService);
    private extractDateFromPdf;
    private isPayrollDuplicate;
    uploadPayroll(payrolls: Express.Multer.File[]): Promise<{
        success: boolean;
        processed: number;
        results: any[];
        errors: any[];
    }>;
    getPayrolls(): Promise<import("./entities/payroll.entity").Payroll[]>;
    findAllPayrolls(page: string, limit: string, userId?: string, month?: string, year?: string, searchTerm?: string): Promise<{
        data: import("./entities/payroll.entity").Payroll[];
        meta: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getLastFivePayrolls(): Promise<{
        success: boolean;
        data: import("./entities/payroll.entity").Payroll[];
        meta: {
            totalItems: number;
            itemsReturned: number;
        };
    }>;
}
