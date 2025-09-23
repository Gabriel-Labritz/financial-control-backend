import { Transaction } from '../../transaction/entity/Transaction';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ unique: true, length: 50 })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // relation
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
