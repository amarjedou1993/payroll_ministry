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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_util_1 = require("../common/utils/crypto.util");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
let AuthService = class AuthService {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        const user = await this.userService.findByUsername(username);
        if (!user) {
            throw new common_1.BadRequestException('User does not exist');
        }
        const isCorrectPassword = await (0, crypto_util_1.comparePassword)(password, user.password);
        if (isCorrectPassword) {
            return user;
        }
        return null;
    }
    async login(user) {
        const { id, username, roles } = user;
        const accessTocken = this.jwtService.sign({
            sub: id,
            username: username,
            roles: roles,
        });
        return {
            id,
            username,
            access_token: accessTocken,
        };
    }
    async register(createUserDto) {
        return this.userService.createUser(createUserDto);
    }
    async updateProfile(id, updateUserDto) {
        return this.userService.updateUser(id, updateUserDto);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map