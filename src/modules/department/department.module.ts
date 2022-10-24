import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department } from './entities/department.entity';

@Module({
  providers: [DepartmentService],

  imports: [TypeOrmModule.forFeature([Department]), UserModule],
  exports: [DepartmentService],
  controllers: [DepartmentController],
})
export class DepartmentModule {}
