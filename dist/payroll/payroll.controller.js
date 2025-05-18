"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const payroll_service_1 = require("./payroll.service");
const user_service_1 = require("../user/user.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const pdf_service_1 = require("../pdf/pdf.service");
const pdfParse = require("pdf-parse");
const permissions_decorator_1 = require("../role/decorator/permissions.decorator");
const permission_enum_1 = require("../role/enum/permission.enum");
const extractDateFromContent = (content) => {
    const datePattern = /[^\d]*(\d{2})[-\/](\d{4})/i;
    const normalizedContent = content
        .replace(/[\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[‐‑‒–—−]/g, '-');
    const match = normalizedContent.match(datePattern);
    if (match && match[1] && match[2]) {
        const month = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        if (month >= 1 && month <= 12 && year >= 2000 && year <= 2099) {
            return `${match[1].padStart(2, '0')}-${match[2]}`;
        }
    }
    return null;
};
let PayrollController = class PayrollController {
    constructor(payrollService, userService, pdfService) {
        this.payrollService = payrollService;
        this.userService = userService;
        this.pdfService = pdfService;
        this.extractedDate = null;
    }
    async extractDateFromPdf(payrollPath) {
        const pdfBuffer = await this.pdfService.getPdfBuffer(payrollPath);
        const pdfText = await pdfParse(pdfBuffer);
        const dateFromDocument = extractDateFromContent(pdfText.text);
        console.log(dateFromDocument);
        if (!dateFromDocument) {
            throw new Error('Date (MM-YYYY) not found in document');
        }
        return dateFromDocument;
    }
    async isPayrollDuplicate(employeeId, extractedDate) {
        const existingPayroll = await this.payrollService.findByEmployeeAndPeriod(employeeId, extractedDate);
        return !!existingPayroll;
    }
    async uploadPayroll(payrolls) {
        const results = [];
        const errors = [];
        for (const payroll of payrolls) {
            const payrollPath = payroll.path;
            try {
                const extractedDate = await this.extractDateFromPdf(payrollPath);
                console.log(`Extracted Date from PDF: ${extractedDate}`);
                const employeePages = await this.pdfService.splitAndProcessPdf(payrollPath);
                if (employeePages.size === 0) {
                    throw new Error('No employee IDs found in document');
                }
                for (const [employeeId, pages] of employeePages.entries()) {
                    const user = await this.userService.findByEmployeeId(employeeId);
                    if (!user) {
                        throw new common_1.NotFoundException(`User ${employeeId} not found`);
                    }
                    const isDuplicate = await this.isPayrollDuplicate(employeeId, extractedDate);
                    if (isDuplicate) {
                        errors.push({
                            file: payroll.originalname,
                            employeeId,
                            error: `Payroll for period ${extractedDate} already exists for employee ${employeeId}`,
                        });
                        continue;
                    }
                    const targetDir = `./uploads/${employeeId}`;
                    if (!(0, fs_1.existsSync)(targetDir))
                        (0, fs_1.mkdirSync)(targetDir, { recursive: true });
                    const fileExt = (0, path_1.extname)(payroll.originalname);
                    const newFilename = `${employeeId}-${extractedDate}${fileExt}`;
                    const outputPath = (0, path_1.join)(targetDir, newFilename);
                    await this.pdfService.createEmployeePdf(payrollPath, pages, outputPath);
                    await this.payrollService.create({
                        filename: newFilename,
                        path: outputPath,
                        user,
                        period: extractedDate,
                    });
                    results.push({
                        original: payroll.originalname,
                        employeeId,
                        pages: pages.length,
                        newFilename,
                    });
                }
            }
            catch (error) {
                errors.push({
                    file: payroll.originalname,
                    error: error.response?.message || error.message,
                });
            }
            finally {
                if ((0, fs_1.existsSync)(payrollPath))
                    (0, fs_1.unlinkSync)(payrollPath);
            }
        }
        return {
            success: errors.length === 0,
            processed: results.length,
            results,
            errors,
        };
    }
    async getPayrolls() {
        return this.payrollService.getPayrolls();
    }
    async findAllPayrolls(page, limit, userId, month, year, searchTerm) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 8;
        const parsedUserId = userId ? parseInt(userId, 10) : undefined;
        const parsedMonth = month ? parseInt(month, 10) : undefined;
        const parsedYear = year ? parseInt(year, 10) : undefined;
        return this.payrollService.getAllPayrolls(pageNum, limitNum, parsedUserId, parsedMonth, parsedYear, searchTerm);
    }
    async getLastFivePayrolls() {
        const result = await this.payrollService.getLastFivePayrolls();
        return { success: true, data: result.data, meta: result.meta };
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('payrolls', 700, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/tmp',
            filename: (_, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                callback(null, `${uniqueSuffix}${ext}`);
            },
        }),
    })),
    (0, permissions_decorator_1.Permissions)(permission_enum_1.Permission.UploadPayroll),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "uploadPayroll", null);
__decorate([
    (0, common_1.Get)('payrolls'),
    (0, permissions_decorator_1.Permissions)(permission_enum_1.Permission.ViewPayrolls),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrolls", null);
__decorate([
    (0, common_1.Get)('limitedPayrolls'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('month')),
    __param(4, (0, common_1.Query)('year')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "findAllPayrolls", null);
__decorate([
    (0, common_1.Get)('lastFive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getLastFivePayrolls", null);
exports.PayrollController = PayrollController = __decorate([
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService,
        user_service_1.UserService,
        pdf_service_1.PdfService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map