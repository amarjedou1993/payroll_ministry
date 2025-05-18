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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payroll_entity_1 = require("./entities/payroll.entity");
let PayrollService = class PayrollService {
    constructor(payrollRepository) {
        this.payrollRepository = payrollRepository;
    }
    async create(payrollDto) {
        const existingPayroll = await this.findByEmployeeAndPeriod(payrollDto.user.employeeId, payrollDto.period);
        if (existingPayroll) {
            throw new common_1.ConflictException(`Payroll for period ${payrollDto.period} already exists.`);
        }
        const payroll = this.payrollRepository.create(payrollDto);
        return this.payrollRepository.save(payroll);
    }
    async getPayrolls() {
        return this.payrollRepository.find({
            relations: ['user'],
            order: { period: 'DESC' },
        });
    }
    async findPayrolls(page = 1, limit = 6, userId) {
        page = Math.max(page, 1);
        limit = Math.min(Math.max(limit, 1), 50);
        const skip = (page - 1) * limit;
        const query = this.payrollRepository
            .createQueryBuilder('payroll')
            .leftJoinAndSelect('payroll.user', 'user')
            .orderBy('payroll.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        if (userId) {
            query.andWhere('user.id = :userId', { userId });
        }
        const [payrolls, totalItems] = await query.getManyAndCount();
        return {
            data: payrolls,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        };
    }
    async findAllPayrolls(page = 1, limit = 6, userId, searchTerm, sortBy = 'modified') {
        page = Math.max(page, 1);
        limit = Math.min(Math.max(limit, 1), 50);
        const skip = (page - 1) * limit;
        const query = this.payrollRepository
            .createQueryBuilder('payroll')
            .leftJoinAndSelect('payroll.user', 'user');
        if (searchTerm) {
            query.where('(LOWER(payroll.filename) LIKE LOWER(:searchTerm) OR LOWER(payroll.period) LIKE LOWER(:searchTerm))', { searchTerm: `%${searchTerm}%` });
        }
        if (userId) {
            query.andWhere('user.id = :userId', { userId });
        }
        switch (sortBy) {
            case 'opened':
                query.orderBy('payroll.lastOpened', 'DESC');
                break;
            case 'modified':
            default:
                query.orderBy('payroll.createdAt', 'DESC');
                break;
        }
        query.skip(skip).take(limit);
        const [payrolls, totalItems] = await query.getManyAndCount();
        return {
            data: payrolls,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        };
    }
    async getAllPayrolls(page, limit, userId, month, year, searchTerm) {
        const query = this.payrollRepository
            .createQueryBuilder('payroll')
            .leftJoinAndSelect('payroll.user', 'user')
            .orderBy('payroll.createdAt', 'DESC');
        if (userId !== undefined) {
            query.andWhere('payroll.user_id = :userId', { userId });
        }
        if (month !== undefined && year !== undefined) {
            const formattedPeriod = `${(month + 1).toString().padStart(2, '0')}-${year}`;
            query.andWhere('payroll.period = :period', { period: formattedPeriod });
        }
        if (searchTerm) {
            const searchPattern = `%${searchTerm}%`;
            query.andWhere('(user.name ILIKE :searchTerm OR ' +
                'user.employeeId ILIKE :searchTerm OR ' +
                'payroll.filename ILIKE :searchTerm)', { searchTerm: searchPattern });
        }
        const [payrolls, totalItems] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: payrolls,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        };
    }
    async getLastFivePayrolls() {
        const [payrolls, totalItems] = await this.payrollRepository
            .createQueryBuilder('payroll')
            .leftJoinAndSelect('payroll.user', 'user')
            .orderBy('payroll.createdAt', 'DESC')
            .take(5)
            .getManyAndCount();
        return {
            data: payrolls,
            meta: {
                totalItems,
                itemsReturned: payrolls.length,
            },
        };
    }
    async remove(id) {
        const result = await this.payrollRepository.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException(`Payroll with ID ${id} not found`);
    }
    async removeByFilename(filename) {
        const result = await this.payrollRepository.delete({ filename });
        if (result.affected === 0)
            throw new common_1.NotFoundException(`Payroll with filename ${filename} not found`);
    }
    async removeByPath(path) {
        const result = await this.payrollRepository.delete({ path });
        if (result.affected === 0)
            throw new common_1.NotFoundException(`Payroll with path ${path} not found`);
    }
    async removeMultiple(ids) {
        const result = await this.payrollRepository.delete(ids);
        if (result.affected === 0)
            throw new common_1.NotFoundException(`No payrolls found for the given IDs`);
    }
    async findByEmployeeAndPeriod(employeeId, period) {
        return this.payrollRepository.findOne({
            where: {
                user: { employeeId },
                period,
            },
        });
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map