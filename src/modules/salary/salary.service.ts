import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salary } from './entities/salary.entity';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private readonly userRepository: Repository<Salary>,
  ) {}

  create(salaries: Partial<Salary[]>): void {
    this.userRepository.insert(this.userRepository.create(salaries));
  }

  find(id: number) {
    return this.userRepository.find({ where: { id: 1 } });
  }
}
