import { BaseEntity } from '@common/entity/base.entity';
import { Payroll } from '@payroll/entities/payroll.entity';
import { Role } from '@role/entities/role.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 155 })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  employeeId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  position: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @OneToMany(() => Payroll, (payroll) => payroll.user, {
    onDelete: 'CASCADE',
  })
  payrolls: Payroll[];
}
