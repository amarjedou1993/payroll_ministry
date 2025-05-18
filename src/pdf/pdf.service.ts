import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly userService: UserService) {
    // Set the worker source for pdfjs
    // pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }

  private async extractEmployeeIdsFromDb(): Promise<string[]> {
    // Retrieve employee IDs from the database (replace this with your actual DB query)
    const employees = await this.userService.getAllEmployeeIds();
    return employees;
  }

  private findEmployeeIdInText(
    text: string,
    employeeIds: string[],
  ): string | null {
    // Check if any employee ID from the database exists in the PDF content
    for (const employeeId of employeeIds) {
      if (text.includes(employeeId)) {
        return employeeId;
      }
    }
    return null;
  }

  async splitAndProcessPdf(filePath: string): Promise<Map<string, number[]>> {
    try {
      const dataBuffer = readFileSync(filePath);
      const pdfjsLib = pdfjs; // pdfjs is loaded here

      const employeePages = new Map<string, number[]>();
      const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
      const pdfDoc = await loadingTask.promise;

      // Fetch employee IDs from the database
      const employeeIds = await this.extractEmployeeIdsFromDb();

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');

        // Check if any employee ID from the DB is found in the page's text
        const employeeId = this.findEmployeeIdInText(text, employeeIds);
        if (employeeId && !employeePages.has(employeeId)) {
          // Add the page only if this employeeId hasn't been seen before
          employeePages.set(employeeId, [pageNum]);
        }
      }

      return employeePages;
    } catch (error) {
      this.logger.error(`PDF processing failed for ${filePath}`, error.stack);
      throw error;
    }
  }

  async createEmployeePdf(
    filePath: string,
    pages: number[],
    outputPath: string,
  ): Promise<void> {
    try {
      const originalDoc = await PDFDocument.load(readFileSync(filePath));
      const newDoc = await PDFDocument.create();

      const copiedPages = await newDoc.copyPages(
        originalDoc,
        pages.map((p) => p - 1),
      );
      copiedPages.forEach((page) => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      writeFileSync(outputPath, pdfBytes);
      this.logger.log(`Created PDF for employee: ${outputPath}`);
    } catch (error) {
      this.logger.error(`PDF creation failed for ${outputPath}`, error.stack);
      throw error;
    }
  }

  //   async processUploadedPayroll(filePath: string): Promise<void> {
  //     try {
  //       const employeePages = await this.splitAndProcessPdf(filePath);

  //       for (const [employeeId, pages] of employeePages.entries()) {
  //         const outputPath = `./payrolls/${employeeId}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
  //         await this.createEmployeePdf(filePath, pages, outputPath);
  //       }

  //       unlinkSync(filePath);
  //       this.logger.log('Payroll processing completed.');
  //     } catch (error) {
  //       this.logger.error('Payroll processing failed', error.stack);
  //     }
  //   }

  async getPdfBuffer(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject('Error reading PDF file: ' + err.message);
        } else {
          resolve(data);
        }
      });
    });
  }

  async processUploadedPayroll(filePath: string): Promise<void> {
    try {
      const employeePages = await this.splitAndProcessPdf(filePath);

      for (const [employeeId, pages] of employeePages.entries()) {
        // Get the current date in MM-YY format
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of the year

        // Generate the output filename in the format: employeeId-MM-YY
        const outputPath = `./payrolls/${employeeId}-${month}-${year}.pdf`;

        // Create the PDF for this employee with the selected pages
        await this.createEmployeePdf(filePath, pages, outputPath);
      }

      unlinkSync(filePath); // Delete the original file after processing
      this.logger.log('Payroll processing completed.');
    } catch (error) {
      this.logger.error('Payroll processing failed', error.stack);
    }
  }
}
