import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    createRole(createRoleDto: CreateRoleDto): Promise<import("./entities/role.entity").Role>;
    getRole(): Promise<import("./entities/role.entity").Role[]>;
}
