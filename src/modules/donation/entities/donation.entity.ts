import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Donation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 5, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @ManyToOne((type) => User, (user) => user.donation)
  user: User;

  @Column()
  userId: number;

  @Column()
  date: Date;

  @Column({ default: new Date() })
  createdAt: Date;
}
