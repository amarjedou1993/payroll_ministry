import { Module, forwardRef } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { UserModule } from '@user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
