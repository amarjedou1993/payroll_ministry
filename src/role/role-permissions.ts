import { Permission } from './enum/permission.enum';
import { Role } from './enum/role.enum';

export const RolePermissions = {
  [Role.Admin]: [
    Permission.CreateUser,
    Permission.CreateRole,
    Permission.ViewProfile,
    Permission.ViewUser,
    Permission.ViewUsers,
    Permission.ViewRoles,
    Permission.ViewPayroll,
    Permission.ViewPayrolls,
    Permission.RemoveUser,
    Permission.RemoveRole,
    Permission.RemovePayroll,
    Permission.UpdateProfile,
    Permission.UpdateRole,
    Permission.UpdateUser,
    Permission.UploadPayroll,
  ],
  [Role.Manager]: [
    Permission.ViewProfile,
    Permission.UploadPayroll,
    Permission.ViewPayrolls,
    Permission.UpdateProfile,
    Permission.ViewUsers,
  ],
  [Role.Employee]: [
    Permission.ViewProfile,
    Permission.ViewPayroll,
    Permission.UpdateProfile,
  ],
};
