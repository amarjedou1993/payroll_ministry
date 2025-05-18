import { BaseEntity } from '@common/entity/base.entity';
import { User } from '@user/entities/user.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
