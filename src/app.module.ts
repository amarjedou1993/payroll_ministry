import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { PayrollModule } from './payroll/payroll.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@database/database.module';
import { PdfModule } from './pdf/pdf.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { UserSubscriber } from '@user/user.subscribe';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    UserModule,
    AuthModule,
    RoleModule,
    PayrollModule,
    DatabaseModule,
    PdfModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    new UserSubscriber(this.dataSource); // ⬅️ This activates the subscriber!
  }
}
