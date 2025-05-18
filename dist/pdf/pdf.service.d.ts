import { UserService } from '@user/user.service';
export declare class PdfService {
    private readonly userService;
    private readonly logger;
    constructor(userService: UserService);
    private extractEmployeeIdsFromDb;
    private findEmployeeIdInText;
    splitAndProcessPdf(filePath: string): Promise<Map<string, number[]>>;
    createEmployeePdf(filePath: string, pages: number[], outputPath: string): Promise<void>;
    getPdfBuffer(filePath: string): Promise<Buffer>;
    processUploadedPayroll(filePath: string): Promise<void>;
}
