import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { SalaryModule } from './modules/salary/salary.module';
import { DonationModule } from './modules/donation/donation.module';
import { typeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentModule } from './modules/department/department.module';
import { FileNameModule } from './modules/file-name/file-name.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    SalaryModule,
    DonationModule,
    DepartmentModule,
    FileNameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
