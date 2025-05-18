"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Private = void 0;
const jwt_auth_guard_1 = require("../../auth/guard/jwt-auth.guard");
const common_1 = require("@nestjs/common");
const permission_guard_1 = require("../../role/guard/permission.guard");
const Private = () => (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard);
exports.Private = Private;
//# sourceMappingURL=private.decorator.js.map