import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
  Get,
  Query,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { UserService } from '@user/user.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { PdfService } from 'src/pdf/pdf.service';
import * as pdfParse from 'pdf-parse'; // Import pdf-parse library
import { Permissions } from '@role/decorator/permissions.decorator';
import { Permission } from '@role/enum/permission.enum';

// Helper function to extract MM-YYYY date from the content
const extractDateFromContent = (content: string): string | null => {
  // Regex to match "mois de" or "لشهر" followed by a MM/YYYY or MM-YYYY pattern
  // const datePattern = /(?:mois de|لشهر)[^\d]*(\d{2})[-\/](\d{4})/i;
  const datePattern = /[^\d]*(\d{2})[-\/](\d{4})/i;

  const normalizedContent = content
    .replace(/[\n\r]/g, ' ') // Replace line breaks with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[‐‑‒–—−]/g, '-'); // Normalize hyphens

  const match = normalizedContent.match(datePattern);

  if (match && match[1] && match[2]) {
    // Validate month (01-12) and year (2000-2099)
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);

    if (month >= 1 && month <= 12 && year >= 2000 && year <= 2099) {
      return `${match[1].padStart(2, '0')}-${match[2]}`;
    }
  }

  return null;
};

@Controller('payroll')
// @Private()
export class PayrollController {
  private extractedDate: string | null = null;

  constructor(
    private readonly payrollService: PayrollService,
    private readonly userService: UserService,
    private readonly pdfService: PdfService,
  ) {}

  private async extractDateFromPdf(payrollPath: string): Promise<string> {
    const pdfBuffer = await this.pdfService.getPdfBuffer(payrollPath);
    const pdfText = await pdfParse(pdfBuffer);

    const dateFromDocument = extractDateFromContent(pdfText.text);
    console.log(dateFromDocument);
    if (!dateFromDocument) {
      throw new Error('Date (MM-YYYY) not found in document');
    }
    return dateFromDocument;
  }

  private async isPayrollDuplicate(
    employeeId: string,
    extractedDate: string,
  ): Promise<boolean> {
    const existingPayroll = await this.payrollService.findByEmployeeAndPeriod(
      employeeId,
      extractedDate, // Use extractedDate from parameter
    );
    return !!existingPayroll;
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('payrolls', 700, {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (_, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @Permissions(Permission.UploadPayroll)
  async uploadPayroll(@UploadedFiles() payrolls: Express.Multer.File[]) {
    const results = [];
    const errors = [];

    for (const payroll of payrolls) {
      const payrollPath = payroll.path;

      try {
        // Extract date from the document for each payroll
        const extractedDate = await this.extractDateFromPdf(payrollPath);
        console.log(`Extracted Date from PDF: ${extractedDate}`);

        const employeePages =
          await this.pdfService.splitAndProcessPdf(payrollPath);
        if (employeePages.size === 0) {
          throw new Error('No employee IDs found in document');
        }

        for (const [employeeId, pages] of employeePages.entries()) {
          const user = await this.userService.findByEmployeeId(employeeId);
          if (!user) {
            throw new NotFoundException(`User ${employeeId} not found`);
          }

          // Check for duplicate payroll for the employee and period
          const isDuplicate = await this.isPayrollDuplicate(
            employeeId,
            extractedDate,
          ); // Pass extractedDate explicitly
          if (isDuplicate) {
            errors.push({
              file: payroll.originalname,
              employeeId,
              error: `Payroll for period ${extractedDate} already exists for employee ${employeeId}`,
            });
            continue; // Skip processing for this employee
          }

          // Create employee-specific directory if not exists
          const targetDir = `./uploads/${employeeId}`;
          if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

          // Generate filename using the extracted date
          const fileExt = extname(payroll.originalname);
          const newFilename = `${employeeId}-${extractedDate}${fileExt}`;
          const outputPath = join(targetDir, newFilename);

          // Create and save the PDF
          await this.pdfService.createEmployeePdf(
            payrollPath,
            pages,
            outputPath,
          );

          // Save to database, including the period (extracted date)
          await this.payrollService.create({
            filename: newFilename,
            path: outputPath,
            user,
            period: extractedDate, // Save the extracted date here
          });

          results.push({
            original: payroll.originalname,
            employeeId,
            pages: pages.length,
            newFilename,
          });
        }
      } catch (error) {
        errors.push({
          file: payroll.originalname,
          error: error.response?.message || error.message,
        });
      } finally {
        // Cleanup temporary file after all processing
        if (existsSync(payrollPath)) unlinkSync(payrollPath);
      }
    }

    return {
      success: errors.length === 0,
      processed: results.length,
      results,
      errors,
    };
  }

  @Get('payrolls')
  @Permissions(Permission.ViewPayrolls)
  async getPayrolls() {
    return this.payrollService.getPayrolls();
  }

  @Get('limitedPayrolls')
  async findAllPayrolls(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('userId') userId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('search') searchTerm?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;

    // Parse parameters as numbers
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedMonth = month ? parseInt(month, 10) : undefined;
    const parsedYear = year ? parseInt(year, 10) : undefined;

    return this.payrollService.getAllPayrolls(
      pageNum,
      limitNum,
      parsedUserId, // Pass as number
      parsedMonth,
      parsedYear,
      searchTerm,
    );
  }

  @Get('lastFive')
  async getLastFivePayrolls() {
    const result = await this.payrollService.getLastFivePayrolls();
    return { success: true, data: result.data, meta: result.meta };
  }
}
