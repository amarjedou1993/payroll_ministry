import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RoleService } from '@role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { hashPassword } from '@common/utils/crypto.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { PayrollService } from '@payroll/payroll.service';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import * as rimraf from 'rimraf';
import * as XLSX from 'xlsx';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly payrollService: PayrollService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findByEmployeeId(createUserDto.employeeId);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hashPassword(createUserDto.password);
    const assignedRoles = await this.roleService.getRolesByNames(
      createUserDto.roles || ['Employee'],
    );

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: assignedRoles,
    });

    return await this.userRepository.save(newUser);
  }

  async getAllEmployeeIds(): Promise<string[]> {
    const users = await this.userRepository.find();
    return users.map((user) => user.employeeId);
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
      select: ['id', 'username', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmployeeId(employeeId: string) {
    return this.userRepository.findOne({
      where: { employeeId },
      relations: ['roles'],
    });
  }

  async findUsers(): Promise<UserResponseDto[]> {
    return this.userRepository.find({
      relations: ['roles'],
      select: {
        roles: { id: true, name: true },
      },
    });
  }

  // Paginated users with role filter and search
  async findAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: string,
    search?: string,
  ): Promise<{
    data: UserResponseDto[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    // Validate page and limit
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(50, limit)); // Cap limit at 50
    const skip = (page - 1) * limit;

    // Build the query
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

    // Apply role filter
    if (role) {
      query.andWhere('roles.name = :role', { role });
    }

    // Apply search filter (name, username, employeeId)
    if (search) {
      const searchTerm = `%${search}%`;
      query.andWhere(
        '(user.name ILIKE :searchTerm OR user.username ILIKE :searchTerm OR user.employeeId ILIKE :searchTerm)',
        { searchTerm },
      );
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

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new BadRequestException(`No user with id: ${id}`);
    }

    Object.assign(existingUser, updateUserDto);

    if (updateUserDto.password) {
      const hashedPassword = await hashPassword(updateUserDto.password);
      Object.assign(existingUser, updateUserDto, { password: hashedPassword });
    }

    if (updateUserDto.roles) {
      const assignedRoles = await this.roleService.getRolesByNames(
        updateUserDto.roles,
      );
      Object.assign(existingUser, { roles: assignedRoles });
    }

    return await this.userRepository.save(existingUser);
  }

  async removeUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['payrolls'],
    });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (user.payrolls && user.payrolls.length > 0) {
      for (const payroll of user.payrolls) {
        if (existsSync(payroll.path)) {
          unlinkSync(payroll.path);
        }
        await this.payrollService.removeByFilename(payroll.filename);
      }
    }

    const userFolderPath = join('./uploads', user.employeeId);
    if (existsSync(userFolderPath)) {
      rimraf.sync(userFolderPath);
    }

    return await this.userRepository.delete(id);
  }

  async findUserById(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async getPayrollsByUserId(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['payrolls'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.payrolls;
  }

  // // Helper method to parse Excel file
  // private parseExcelFile(fileBuffer: Buffer): {
  //   matricule: string;
  //   prenom: string;
  //   nom: string;
  //   position: string;
  //   role: string;
  // }[] {
  //   const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  //   const sheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[sheetName];

  //   console.log('Raw sheet data:', XLSX.utils.sheet_to_json(sheet)); // Log raw data without header mapping
  //   const data = XLSX.utils.sheet_to_json(sheet, {
  //     header: ['matricule', 'prenom', 'nom', 'position', 'role'],
  //     range: 1,
  //   });

  //   return data.map((row: any) => ({
  //     matricule: row.matricule,
  //     prenom: row.prenom,
  //     nom: row.nom,
  //     position: row.position,
  //     role: row.role || 'Employee',
  //   }));
  // }

  // async importUsersFromFile(
  //   file: Express.Multer.File,
  // ): Promise<{ savedUsers: UserResponseDto[]; skippedCount: number }> {
  //   console.log('Starting importUsersFromFile');
  //   const users = this.parseExcelFile(file.buffer);
  //   console.log('Users from parseExcelFile:', users);

  //   if (users.length === 0) {
  //     throw new BadRequestException('No valid user data found in the file');
  //   }

  //   const newUsers = await Promise.all(
  //     users.map(async (userData, index) => {
  //       console.log(`Processing row ${index}:`, userData);
  //       const matricule = String(userData.matricule || '').trim();
  //       const prenom = String(userData.prenom || '').trim();
  //       const nom = String(userData.nom || '').trim();
  //       const position = String(userData.position || '').trim();
  //       const role = String(userData.role || 'Employee').trim();

  //       console.log(`Row ${index} after normalization:`, {
  //         matricule,
  //         prenom,
  //         nom,
  //         position,
  //         role,
  //       });

  //       if (!matricule) {
  //         console.warn(
  //           `Skipping row ${index} with missing matricule: ${JSON.stringify(userData)}`,
  //         );
  //         return null;
  //       }

  //       // Check for existing employeeId
  //       const existingUserByEmployeeId = await this.findByEmployeeId(matricule);
  //       console.log(
  //         `findByEmployeeId(${matricule}) result:`,
  //         existingUserByEmployeeId,
  //       );
  //       if (existingUserByEmployeeId) {
  //         console.warn(
  //           `Row ${index}: User with employeeId ${matricule} already exists, skipping`,
  //         );
  //         return null;
  //       }

  //       // Generate initial username
  //       let username = `${prenom}${nom}`.toLowerCase().replace(/\s+/g, '');
  //       // Check for existing username in the database
  //       const existingUserByUsername = await this.userRepository.findOne({
  //         where: { username },
  //       });
  //       if (existingUserByUsername) {
  //         console.warn(
  //           `Row ${index}: Username '${username}' already exists in database, appending matricule`,
  //         );
  //         username = `${username}_${matricule}`; // Ensure uniqueness
  //       }

  //       const password =
  //         `${prenom.charAt(0)}${nom.charAt(0)}@culture`.toLowerCase();
  //       const hashedPassword = await hashPassword(password);

  //       const assignedRoles = await this.roleService.getRolesByNames([role]);
  //       if (!assignedRoles.length) {
  //         console.warn(
  //           `Row ${index}: Role '${role}' not found, defaulting to 'Employee'`,
  //         );
  //         const defaultRoles = await this.roleService.getRolesByNames([
  //           'Employee',
  //         ]);
  //         if (!defaultRoles.length) {
  //           throw new BadRequestException(`Default role 'Employee' not found`);
  //         }
  //         return this.userRepository.create({
  //           employeeId: matricule,
  //           username,
  //           password: hashedPassword,
  //           name: `${prenom} ${nom}`,
  //           position,
  //           roles: defaultRoles,
  //         });
  //       }

  //       return this.userRepository.create({
  //         employeeId: matricule,
  //         username,
  //         password: hashedPassword,
  //         name: `${prenom} ${nom}`,
  //         position,
  //         roles: assignedRoles,
  //       });
  //     }),
  //   );

  //   const validUsers = newUsers.filter((user) => user !== null);
  //   console.log('Valid users before deduplication:', validUsers);

  //   // Deduplicate by both employeeId and username within the Excel file
  //   const uniqueUsersMap = new Map<string, User>();
  //   const usernameSet = new Set<string>();
  //   validUsers.forEach((user) => {
  //     if (
  //       !uniqueUsersMap.has(user.employeeId) &&
  //       !usernameSet.has(user.username)
  //     ) {
  //       uniqueUsersMap.set(user.employeeId, user);
  //       usernameSet.add(user.username);
  //     } else {
  //       console.warn(
  //         `Row skipped: Duplicate employeeId ${user.employeeId} or username ${user.username} in Excel file`,
  //       );
  //     }
  //   });
  //   const uniqueUsers = Array.from(uniqueUsersMap.values());
  //   const skippedCount = users.length - uniqueUsers.length;
  //   console.log('Unique users to save:', uniqueUsers);

  //   if (uniqueUsers.length === 0) {
  //     throw new BadRequestException('No new users to import after filtering');
  //   }

  //   // Save users individually to avoid atomic rollback
  //   const savedUsers: UserResponseDto[] = [];
  //   for (const user of uniqueUsers) {
  //     try {
  //       const savedUser = await this.userRepository.save(user);
  //       savedUsers.push(savedUser);
  //     } catch (error) {
  //       if (error.code === '23505') {
  //         console.warn(
  //           `Skipping user ${user.employeeId}: Duplicate ${error.detail || 'key'} detected`,
  //         );
  //       } else {
  //         console.error(`Error saving user ${user.employeeId}:`, error);
  //       }
  //     }
  //   }

  //   console.log('Saved users:', savedUsers);
  //   return { savedUsers, skippedCount };
  // }

  // Helper method to parse Excel file
  private parseExcelFile(fileBuffer: Buffer): {
    matricule: string;
    prenom: string;
    nom: string;
    position: string;
    role: string;
  }[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    console.log('Raw sheet data:', XLSX.utils.sheet_to_json(sheet)); // Log raw data without header mapping
    const data = XLSX.utils.sheet_to_json(sheet, {
      header: ['matricule', 'prenom', 'nom', 'position', 'role'],
      range: 1,
    });

    return data.map((row: any) => ({
      matricule: row.matricule,
      prenom: row.prenom,
      nom: row.nom,
      position: row.position,
      role: row.role || 'Employee',
    }));
  }

  async importUsersFromFile(
    file: Express.Multer.File,
  ): Promise<{ savedUsers: UserResponseDto[]; skippedCount: number }> {
    console.log('Starting importUsersFromFile');
    const users = this.parseExcelFile(file.buffer);
    console.log('Users from parseExcelFile:', users);

    if (users.length === 0) {
      throw new BadRequestException('No valid user data found in the file');
    }

    const newUsers = await Promise.all(
      users.map(async (userData, index) => {
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
          console.warn(
            `Skipping row ${index} with missing matricule: ${JSON.stringify(userData)}`,
          );
          return null;
        }

        // Check for existing employeeId
        const existingUserByEmployeeId = await this.findByEmployeeId(matricule);
        console.log(
          `findByEmployeeId(${matricule}) result:`,
          existingUserByEmployeeId,
        );
        if (existingUserByEmployeeId) {
          console.warn(
            `Row ${index}: User with employeeId ${matricule} already exists, skipping`,
          );
          return null;
        }

        // Generate username: Capitalize prenom and nom, separated by a space
        const capitalizedPrenom =
          prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase();
        const capitalizedNom =
          nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
        let username = `${capitalizedPrenom} ${capitalizedNom}`;
        // Check for existing username in the database
        const existingUserByUsername = await this.userRepository.findOne({
          where: { username },
        });
        if (existingUserByUsername) {
          console.warn(
            `Row ${index}: Username '${username}' already exists in database, appending matricule`,
          );
          username = `${username}_${matricule}`; // Ensure uniqueness
        }

        // Password is matricule + "37"
        const password = `${matricule}37`;
        const hashedPassword = await hashPassword(password);

        const assignedRoles = await this.roleService.getRolesByNames([role]);
        if (!assignedRoles.length) {
          console.warn(
            `Row ${index}: Role '${role}' not found, defaulting to 'Employee'`,
          );
          const defaultRoles = await this.roleService.getRolesByNames([
            'Employee',
          ]);
          if (!defaultRoles.length) {
            throw new BadRequestException(`Default role 'Employee' not found`);
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
      }),
    );

    const validUsers = newUsers.filter((user) => user !== null);
    console.log('Valid users before deduplication:', validUsers);

    // Deduplicate by both employeeId and username within the Excel file
    const uniqueUsersMap = new Map<string, User>();
    const usernameSet = new Set<string>();
    validUsers.forEach((user) => {
      if (
        !uniqueUsersMap.has(user.employeeId) &&
        !usernameSet.has(user.username)
      ) {
        uniqueUsersMap.set(user.employeeId, user);
        usernameSet.add(user.username);
      } else {
        console.warn(
          `Row skipped: Duplicate employeeId ${user.employeeId} or username ${user.username} in Excel file`,
        );
      }
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());
    const skippedCount = users.length - uniqueUsers.length;
    console.log('Unique users to save:', uniqueUsers);

    if (uniqueUsers.length === 0) {
      throw new BadRequestException('No new users to import after filtering');
    }

    // Save users individually to avoid atomic rollback
    const savedUsers: UserResponseDto[] = [];
    for (const user of uniqueUsers) {
      try {
        const savedUser = await this.userRepository.save(user);
        savedUsers.push(savedUser);
      } catch (error) {
        if (error.code === '23505') {
          console.warn(
            `Skipping user ${user.employeeId}: Duplicate ${error.detail || 'key'} detected`,
          );
        } else {
          console.error(`Error saving user ${user.employeeId}:`, error);
        }
      }
    }

    console.log('Saved users:', savedUsers);
    return { savedUsers, skippedCount };
  }
}
