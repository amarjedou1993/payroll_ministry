import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Private } from '@common/decorator/private.decorator';
import { Permissions } from '@role/decorator/permissions.decorator';
import { Permission } from '@role/enum/permission.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { UserResponseDto } from './dto/user-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@Private()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions(Permission.ViewUsers)
  async getUsers(@Req() req: Request) {
    return this.userService.findUsers();
  }

  @Get('paginatedUsers')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('search') search?: string,
  ): Promise<{
    data: UserResponseDto[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return this.userService.findAllUsers(pageNum, limitNum, role, search);
  }

  @Get(':id')
  @Permissions(Permission.ViewUser)
  async getUser(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  @Patch(':id')
  @Permissions(Permission.UpdateProfile)
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(Permission.RemoveUser)
  async removeUser(@Param('id') userId: number) {
    return await this.userService.removeUser(userId);
  }

  @Get(':id/payrolls')
  async getUserPayrolls(@Param('id') id: string) {
    return this.userService.getPayrollsByUserId(+id);
  }

  @Post('import')
  @Permissions(Permission.CreateUser)
  @UseInterceptors(FileInterceptor('file'))
  async importUsersFromFile(@UploadedFile() file: Express.Multer.File) {
    const { savedUsers, skippedCount } =
      await this.userService.importUsersFromFile(file);
    return {
      message: `Imported ${savedUsers.length} users, skipped ${skippedCount} duplicates`,
      data: savedUsers,
    };
  }
}
