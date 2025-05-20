"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = void 0;
const permission_enum_1 = require("./enum/permission.enum");
const role_enum_1 = require("./enum/role.enum");
exports.RolePermissions = {
    [role_enum_1.Role.Admin]: [
        permission_enum_1.Permission.CreateUser,
        permission_enum_1.Permission.CreateRole,
        permission_enum_1.Permission.ViewProfile,
        permission_enum_1.Permission.ViewUser,
        permission_enum_1.Permission.ViewUsers,
        permission_enum_1.Permission.ViewRoles,
        permission_enum_1.Permission.ViewPayroll,
        permission_enum_1.Permission.ViewPayrolls,
        permission_enum_1.Permission.RemoveUser,
        permission_enum_1.Permission.RemoveRole,
        permission_enum_1.Permission.RemovePayroll,
        permission_enum_1.Permission.UpdateProfile,
        permission_enum_1.Permission.UpdateRole,
        permission_enum_1.Permission.UpdateUser,
        permission_enum_1.Permission.UploadPayroll,
    ],
    [role_enum_1.Role.Manager]: [
        permission_enum_1.Permission.ViewProfile,
        permission_enum_1.Permission.UploadPayroll,
        permission_enum_1.Permission.ViewPayrolls,
        permission_enum_1.Permission.UpdateProfile,
        permission_enum_1.Permission.ViewUsers,
    ],
    [role_enum_1.Role.Employee]: [
        permission_enum_1.Permission.ViewProfile,
        permission_enum_1.Permission.ViewPayroll,
        permission_enum_1.Permission.UpdateProfile,
    ],
};
//# sourceMappingURL=role-permissions.js.map