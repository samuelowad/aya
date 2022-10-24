import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Salary extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne((type) => User, (user) => user.salary)
  user: User;

  @Column()
  userId: number;

  @Column()
  date: Date;

  @Column({ default: new Date() })
  createdAt: Date;
}
