import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const isRoleExisting = await this.roleRepository.findOne({
      where: {
        name: createRoleDto.name,
      },
      select: ['id'],
    });

    if (isRoleExisting) {
      throw new BadRequestException('Role already exists!');
    }

    const newRole = this.roleRepository.create(createRoleDto);

    return this.roleRepository.save(newRole);
  }

  async getRoles() {
    return this.roleRepository.find();
  }

  // async getRolesByNames(roleNames: string[]) {
  //   return this.roleRepository.find({
  //     where: {
  //       name: In(roleNames),
  //     },
  //     select: {
  //       name: true,
  //     },
  //   });
  // }
  async getRolesByNames(names: string[]): Promise<Role[]> {
    const roles = await this.roleRepository.find({
      where: names.map((name) => ({ name })),
    });

    return roles;
  }
}
