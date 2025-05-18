import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UploadPayrollDto } from './dto/upload-payroll.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
  ) {}

  async create(payrollDto: UploadPayrollDto): Promise<Payroll> {
    const existingPayroll = await this.findByEmployeeAndPeriod(
      payrollDto.user.employeeId,
      payrollDto.period,
    );

    if (existingPayroll) {
      throw new ConflictException(
        `Payroll for period ${payrollDto.period} already exists.`,
      );
    }

    const payroll = this.payrollRepository.create(payrollDto);
    return this.payrollRepository.save(payroll);
  }

  async getPayrolls(): Promise<Payroll[]> {
    return this.payrollRepository.find({
      relations: ['user'],
      order: { period: 'DESC' },
    });
  }

  async findPayrolls(
    page: number = 1,
    limit: number = 6,
    userId?: string, // Add userId parameter
  ): Promise<{
    data: Payroll[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    // Prevent invalid values for page and limit
    page = Math.max(page, 1);
    limit = Math.min(Math.max(limit, 1), 50);

    const skip = (page - 1) * limit;

    // Build the query with optional user filter
    const query = this.payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.user', 'user')
      .orderBy('payroll.createdAt', 'DESC')
      // .orderBy('payroll.period', 'DESC')
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

  // payroll.service.ts
  async findAllPayrolls(
    page: number = 1,
    limit: number = 6,
    userId?: string,
    searchTerm?: string,
    sortBy: 'modified' | 'opened' = 'modified',
  ): Promise<{
    data: Payroll[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    page = Math.max(page, 1);
    limit = Math.min(Math.max(limit, 1), 50);
    const skip = (page - 1) * limit;

    const query = this.payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.user', 'user');

    // Add search filter
    if (searchTerm) {
      query.where(
        '(LOWER(payroll.filename) LIKE LOWER(:searchTerm) OR LOWER(payroll.period) LIKE LOWER(:searchTerm))',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    // Add user filter
    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    // Add sorting
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

  async getAllPayrolls(
    page: number,
    limit: number,
    userId?: number,
    month?: number,
    year?: number,
    searchTerm?: string,
  ) {
    const query = this.payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.user', 'user')
      .orderBy('payroll.createdAt', 'DESC');
    // .orderBy('payroll.period', 'DESC');

    if (userId !== undefined) {
      query.andWhere('payroll.user_id = :userId', { userId });
    }

    if (month !== undefined && year !== undefined) {
      const formattedPeriod = `${(month + 1).toString().padStart(2, '0')}-${year}`;
      query.andWhere('payroll.period = :period', { period: formattedPeriod });
    }

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query.andWhere(
        '(user.name ILIKE :searchTerm OR ' +
          'user.employeeId ILIKE :searchTerm OR ' + // 👈 Use exact property name
          'payroll.filename ILIKE :searchTerm)',
        { searchTerm: searchPattern },
      );
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

  async remove(id: number): Promise<void> {
    const result = await this.payrollRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Payroll with ID ${id} not found`);
  }

  async removeByFilename(filename: string): Promise<void> {
    const result = await this.payrollRepository.delete({ filename });
    if (result.affected === 0)
      throw new NotFoundException(
        `Payroll with filename ${filename} not found`,
      );
  }

  async removeByPath(path: string): Promise<void> {
    const result = await this.payrollRepository.delete({ path });
    if (result.affected === 0)
      throw new NotFoundException(`Payroll with path ${path} not found`);
  }

  async removeMultiple(ids: number[]): Promise<void> {
    const result = await this.payrollRepository.delete(ids);
    if (result.affected === 0)
      throw new NotFoundException(`No payrolls found for the given IDs`);
  }

  async findByEmployeeAndPeriod(
    employeeId: string,
    period: string,
  ): Promise<Payroll | null> {
    return this.payrollRepository.findOne({
      where: {
        user: { employeeId },
        period,
      },
    });
  }
}
