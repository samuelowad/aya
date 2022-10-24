import { Module } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { Salary } from './entities/salary.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Salary])],
  exports: [SalaryService],
  providers: [SalaryService],
})
export class SalaryModule {}
