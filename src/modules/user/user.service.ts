import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, In } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectEntityManager('default')
    private readonly entityManager: EntityManager,
  ) {}

  create(user: Partial<User>): Promise<User> {
    return this.userRepository.save(this.userRepository.create(user));
  }

  queryBuilder(query: string): Promise<any> {
    return this.entityManager.query(query);
  }

  massUpdate(amount: number, departmentId: number) {
    this.userRepository.update({ departmentId }, { balance: amount });
  }

  addMassUpdate(amount: number, userIds: Array<number>) {
    this.userRepository.update({ id: In(userIds) }, { balance: +amount });
  }
}
