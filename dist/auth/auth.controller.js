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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const local_auth_guard_1 = require("./guard/local-auth.guard");
const create_user_dto_1 = require("../user/dto/create-user.dto");
const private_decorator_1 = require("../common/decorator/private.decorator");
const update_user_dto_1 = require("../user/dto/update-user.dto");
const jwt_auth_guard_1 = require("./guard/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(createUserDto) {
        console.log(createUserDto.roles);
        return this.authService.register(createUserDto);
    }
    async login(req, res) {
        const { access_token } = await this.authService.login(req.user);
        const sameSiteValue = process.env.NODE_ENV === 'production' ? 'strict' : 'lax';
        res.cookie('jwt', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: sameSiteValue,
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.json({ message: 'Logged in successfully' });
    }
    getAuthStatus(req) {
        if (req.user) {
            const user = req.user;
            return {
                isAuthenticated: true,
                user: {
                    id: user.sub,
                    username: user.username,
                    roles: user.roles,
                },
            };
        }
        else {
            return { isAuthenticated: false };
        }
    }
    async getProfile(req) {
        if (!req.user)
            throw new common_1.UnauthorizedException();
        return req.user;
    }
    async updateProfile(req, updateUserDto) {
        return this.authService.updateProfile(req.user?.username, updateUserDto);
    }
    async logout(res) {
        res.clearCookie('jwt', {
            httpOnly: true,
        });
        return res.json({ message: 'Logged out successfully' });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getAuthStatus", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, private_decorator_1.Private)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, private_decorator_1.Private)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map