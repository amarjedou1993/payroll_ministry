"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
const role_service_1 = require("../role/role.service");
const crypto_util_1 = require("../common/utils/crypto.util");
const payroll_service_1 = require("../payroll/payroll.service");
const fs_1 = require("fs");
const path_1 = require("path");
const rimraf = require("rimraf");
const XLSX = require("xlsx");
let UserService = class UserService {
    constructor(userRepository, roleService, payrollService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.payrollService = payrollService;
    }
    async createUser(createUserDto) {
        const existingUser = await this.findByEmployeeId(createUserDto.employeeId);
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists');
        }
        const hashedPassword = await (0, crypto_util_1.hashPassword)(createUserDto.password);
        const assignedRoles = await this.roleService.getRolesByNames(createUserDto.roles || ['Employee']);
        const newUser = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
            roles: assignedRoles,
        });
        return await this.userRepository.save(newUser);
    }
    async getAllEmployeeIds() {
        const users = await this.userRepository.find();
        return users.map((user) => user.employeeId);
    }
    async findByUsername(username) {
        const user = await this.userRepository.findOne({
            where: { username },
            relations: ['roles'],
            select: ['id', 'username', 'password'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmployeeId(employeeId) {
        return this.userRepository.findOne({
            where: { employeeId },
            relations: ['roles'],
        });
    }
    async findUsers() {
        return this.userRepository.find({
            relations: ['roles'],
            select: {
                roles: { id: true, name: true },
            },
        });
    }
    async findAllUsers(page = 1, limit = 10, role, search) {
        page = Math.max(1, page);
        limit = Math.max(1, Math.min(50, limit));
        const skip = (page - 1) * limit;
        const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .select([
            'user.id',
            'user.name',
            'user.username',
            'user.position',
            'user.employeeId',
            'user.createdAt',
            'roles.id',
            'roles.name',
        ])
            .orderBy('user.name', 'ASC')
            .skip(skip)
            .take(limit);
        if (role) {
            query.andWhere('roles.name = :role', { role });
        }
        if (search) {
            const searchTerm = `%${search}%`;
            query.andWhere('(user.name ILIKE :searchTerm OR user.username ILIKE :searchTerm OR user.employeeId ILIKE :searchTerm)', { searchTerm });
        }
        const [users, totalItems] = await query.getManyAndCount();
        return {
            data: users,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        };
    }
    async updateUser(id, updateUserDto) {
        const existingUser = await this.userRepository.findOne({ where: { id } });
        if (!existingUser) {
            throw new common_1.BadRequestException(`No user with id: ${id}`);
        }
        Object.assign(existingUser, updateUserDto);
        if (updateUserDto.password) {
            const hashedPassword = await (0, crypto_util_1.hashPassword)(updateUserDto.password);
            Object.assign(existingUser, updateUserDto, { password: hashedPassword });
        }
        if (updateUserDto.roles) {
            const assignedRoles = await this.roleService.getRolesByNames(updateUserDto.roles);
            Object.assign(existingUser, { roles: assignedRoles });
        }
        return await this.userRepository.save(existingUser);
    }
    async removeUser(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['payrolls'],
        });
        if (!user) {
            throw new common_1.BadRequestException('User does not exist');
        }
        if (user.payrolls && user.payrolls.length > 0) {
            for (const payroll of user.payrolls) {
                if ((0, fs_1.existsSync)(payroll.path)) {
                    (0, fs_1.unlinkSync)(payroll.path);
                }
                await this.payrollService.removeByFilename(payroll.filename);
            }
        }
        const userFolderPath = (0, path_1.join)('./uploads', user.employeeId);
        if ((0, fs_1.existsSync)(userFolderPath)) {
            rimraf.sync(userFolderPath);
        }
        return await this.userRepository.delete(id);
    }
    async findUserById(id) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['roles'],
        });
    }
    async getPayrollsByUserId(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['payrolls'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return user.payrolls;
    }
    parseExcelFile(fileBuffer) {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        console.log('Raw sheet data:', XLSX.utils.sheet_to_json(sheet));
        const data = XLSX.utils.sheet_to_json(sheet, {
            header: ['matricule', 'prenom', 'nom', 'position', 'role'],
            range: 1,
        });
        return data.map((row) => ({
            matricule: row.matricule,
            prenom: row.prenom,
            nom: row.nom,
            position: row.position,
            role: row.role || 'Employee',
        }));
    }
    async importUsersFromFile(file) {
        console.log('Starting importUsersFromFile');
        const users = this.parseExcelFile(file.buffer);
        console.log('Users from parseExcelFile:', users);
        if (users.length === 0) {
            throw new common_1.BadRequestException('No valid user data found in the file');
        }
        const newUsers = await Promise.all(users.map(async (userData, index) => {
            console.log(`Processing row ${index}:`, userData);
            const matricule = String(userData.matricule || '').trim();
            const prenom = String(userData.prenom || '').trim();
            const nom = String(userData.nom || '').trim();
            const position = String(userData.position || '').trim();
            const role = String(userData.role || 'Employee').trim();
            console.log(`Row ${index} after normalization:`, {
                matricule,
                prenom,
                nom,
                position,
                role,
            });
            if (!matricule) {
                console.warn(`Skipping row ${index} with missing matricule: ${JSON.stringify(userData)}`);
                return null;
            }
            const existingUserByEmployeeId = await this.findByEmployeeId(matricule);
            console.log(`findByEmployeeId(${matricule}) result:`, existingUserByEmployeeId);
            if (existingUserByEmployeeId) {
                console.warn(`Row ${index}: User with employeeId ${matricule} already exists, skipping`);
                return null;
            }
            let username = `${prenom}${nom}`.toLowerCase().replace(/\s+/g, '');
            const existingUserByUsername = await this.userRepository.findOne({
                where: { username },
            });
            if (existingUserByUsername) {
                console.warn(`Row ${index}: Username '${username}' already exists in database, appending matricule`);
                username = `${username}_${matricule}`;
            }
            const password = `${prenom.charAt(0)}${nom.charAt(0)}@culture`.toLowerCase();
            const hashedPassword = await (0, crypto_util_1.hashPassword)(password);
            const assignedRoles = await this.roleService.getRolesByNames([role]);
            if (!assignedRoles.length) {
                console.warn(`Row ${index}: Role '${role}' not found, defaulting to 'Employee'`);
                const defaultRoles = await this.roleService.getRolesByNames([
                    'Employee',
                ]);
                if (!defaultRoles.length) {
                    throw new common_1.BadRequestException(`Default role 'Employee' not found`);
                }
                return this.userRepository.create({
                    employeeId: matricule,
                    username,
                    password: hashedPassword,
                    name: `${prenom} ${nom}`,
                    position,
                    roles: defaultRoles,
                });
            }
            return this.userRepository.create({
                employeeId: matricule,
                username,
                password: hashedPassword,
                name: `${prenom} ${nom}`,
                position,
                roles: assignedRoles,
            });
        }));
        const validUsers = newUsers.filter((user) => user !== null);
        console.log('Valid users before deduplication:', validUsers);
        const uniqueUsersMap = new Map();
        const usernameSet = new Set();
        validUsers.forEach((user) => {
            if (!uniqueUsersMap.has(user.employeeId) &&
                !usernameSet.has(user.username)) {
                uniqueUsersMap.set(user.employeeId, user);
                usernameSet.add(user.username);
            }
            else {
                console.warn(`Row skipped: Duplicate employeeId ${user.employeeId} or username ${user.username} in Excel file`);
            }
        });
        const uniqueUsers = Array.from(uniqueUsersMap.values());
        const skippedCount = users.length - uniqueUsers.length;
        console.log('Unique users to save:', uniqueUsers);
        if (uniqueUsers.length === 0) {
            throw new common_1.BadRequestException('No new users to import after filtering');
        }
        const savedUsers = [];
        for (const user of uniqueUsers) {
            try {
                const savedUser = await this.userRepository.save(user);
                savedUsers.push(savedUser);
            }
            catch (error) {
                if (error.code === '23505') {
                    console.warn(`Skipping user ${user.employeeId}: Duplicate ${error.detail || 'key'} detected`);
                }
                else {
                    console.error(`Error saving user ${user.employeeId}:`, error);
                }
            }
        }
        console.log('Saved users:', savedUsers);
        return { savedUsers, skippedCount };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        role_service_1.RoleService,
        payroll_service_1.PayrollService])
], UserService);
//# sourceMappingURL=user.service.js.map