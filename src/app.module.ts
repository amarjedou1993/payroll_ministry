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
import databaseConfig from '@common/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Essential for global access
      load: [databaseConfig], // Explicitly load your config
      envFilePath: '.env',
    }),
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
    new UserSubscriber(this.dataSource);
  }
}
