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
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const fs_1 = require("fs");
const pdf_lib_1 = require("pdf-lib");
const fs = require("fs");
const pdfjs = require("pdfjs-dist");
const pdf_worker_entry_1 = require("pdfjs-dist/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdf_worker_entry_1.default;
let PdfService = PdfService_1 = class PdfService {
    constructor(userService) {
        this.userService = userService;
        this.logger = new common_1.Logger(PdfService_1.name);
    }
    async extractEmployeeIdsFromDb() {
        const employees = await this.userService.getAllEmployeeIds();
        return employees;
    }
    findEmployeeIdInText(text, employeeIds) {
        for (const employeeId of employeeIds) {
            if (text.includes(employeeId)) {
                return employeeId;
            }
        }
        return null;
    }
    async splitAndProcessPdf(filePath) {
        try {
            const dataBuffer = (0, fs_1.readFileSync)(filePath);
            const pdfjsLib = pdfjs;
            const employeePages = new Map();
            const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
            const pdfDoc = await loadingTask.promise;
            const employeeIds = await this.extractEmployeeIdsFromDb();
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const textContent = await page.getTextContent();
                const text = textContent.items.map((item) => item.str).join(' ');
                const employeeId = this.findEmployeeIdInText(text, employeeIds);
                if (employeeId && !employeePages.has(employeeId)) {
                    employeePages.set(employeeId, [pageNum]);
                }
            }
            return employeePages;
        }
        catch (error) {
            this.logger.error(`PDF processing failed for ${filePath}`, error.stack);
            throw error;
        }
    }
    async createEmployeePdf(filePath, pages, outputPath) {
        try {
            const originalDoc = await pdf_lib_1.PDFDocument.load((0, fs_1.readFileSync)(filePath));
            const newDoc = await pdf_lib_1.PDFDocument.create();
            const copiedPages = await newDoc.copyPages(originalDoc, pages.map((p) => p - 1));
            copiedPages.forEach((page) => newDoc.addPage(page));
            const pdfBytes = await newDoc.save();
            (0, fs_1.writeFileSync)(outputPath, pdfBytes);
            this.logger.log(`Created PDF for employee: ${outputPath}`);
        }
        catch (error) {
            this.logger.error(`PDF creation failed for ${outputPath}`, error.stack);
            throw error;
        }
    }
    async getPdfBuffer(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject('Error reading PDF file: ' + err.message);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    async processUploadedPayroll(filePath) {
        try {
            const employeePages = await this.splitAndProcessPdf(filePath);
            for (const [employeeId, pages] of employeePages.entries()) {
                const date = new Date();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear().toString().slice(-2);
                const outputPath = `./payrolls/${employeeId}-${month}-${year}.pdf`;
                await this.createEmployeePdf(filePath, pages, outputPath);
            }
            (0, fs_1.unlinkSync)(filePath);
            this.logger.log('Payroll processing completed.');
        }
        catch (error) {
            this.logger.error('Payroll processing failed', error.stack);
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map