import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileName } from './entities/file-name.entity';

@Injectable()
export class FileNameService {
  constructor(
    @InjectRepository(FileName)
    private readonly filenameRepository: Repository<FileName>,
  ) {}

  async create(filename: string): Promise<void> {
    const file = await this.findOne(filename);
    const { id } = file || {};
    if (id) {
      return;
    }
    this.filenameRepository.insert(
      this.filenameRepository.create({ name: filename }),
    );
  }

  findOne(filename: string): Promise<FileName> {
    return this.filenameRepository.findOne({ where: { name: filename } });
  }
}
