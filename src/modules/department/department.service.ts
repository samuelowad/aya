import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectEntityManager('default')
    private readonly entityManager: EntityManager,
  ) {}

  async create(departmentData: Partial<Department>): Promise<Department> {
    const department = await this.findByName(departmentData.name);
    const { id } = department || {};
    if (id) {
      return department;
    }
    return this.departmentRepository.save(
      this.departmentRepository.create(departmentData),
    );
  }

  queryBuilder(query: string): Promise<any> {
    return this.entityManager.query(query);
  }

  findByName(name: string): Promise<Department> {
    return this.departmentRepository.findOne({ where: { name: name } });
  }
}
