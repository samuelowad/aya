import { Donation } from '../../donation/entities/donation.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Salary } from 'src/modules/salary/entities/salary.entity';
import { Department } from 'src/modules/department/entities/department.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @OneToMany((type) => Donation, (donation) => donation.user)
  donation: Donation[];

  @OneToMany((type) => Salary, (donation) => donation.user, { eager: true })
  salary: Donation[];

  @OneToOne((type) => Department, (department) => department.user)
  department: Department;

  @Column()
  departmentId: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: new Date() })
  createdAt: Date;
}
