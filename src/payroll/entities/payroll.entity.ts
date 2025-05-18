import { BaseEntity } from '@common/entity/base.entity';
import { User } from '@user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('payrolls')
export class Payroll extends BaseEntity {
  @Column()
  filename: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  period: string;

  @ManyToOne(() => User, (user) => user.payrolls)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
