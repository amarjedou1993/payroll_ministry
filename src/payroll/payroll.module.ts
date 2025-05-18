import { forwardRef, Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { UserModule } from '../user/user.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PdfModule,
    AuthModule,
    TypeOrmModule.forFeature([Payroll]),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
