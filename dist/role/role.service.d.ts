import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
export declare class RoleService {
    private readonly roleRepository;
    constructor(roleRepository: Repository<Role>);
    createRole(createRoleDto: CreateRoleDto): Promise<Role>;
    getRoles(): Promise<Role[]>;
    getRolesByNames(names: string[]): Promise<Role[]>;
}
