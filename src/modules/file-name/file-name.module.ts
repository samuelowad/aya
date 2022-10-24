import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileName } from './entities/file-name.entity';
import { FileNameService } from './file-name.service';

@Module({
  providers: [FileNameService],
  imports: [TypeOrmModule.forFeature([FileName])],
  exports: [FileNameService],
})
export class FileNameModule {}
