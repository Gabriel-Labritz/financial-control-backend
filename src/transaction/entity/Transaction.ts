import { TransactionCategories } from 'src/common/enums/transaction/transaction_categories.enum';
import { TransactionTypes } from 'src/common/enums/transaction/transaction_types.enum';
import { User } from 'src/user/entity/User';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionTypes,
    default: TransactionTypes.EXPENSE,
  })
  type: TransactionTypes;

  @Column({
    type: 'enum',
    enum: TransactionCategories,
    default: TransactionCategories.OTHER,
  })
  category: TransactionCategories;

  @Column({ length: 150, default: '' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relation
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
