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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../../user/user.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const token = req.cookies?.jwt;
        if (!token)
            throw new common_1.UnauthorizedException();
        try {
            const payload = await this.jwtService.verifyAsync(token);
            console.log('Decoded Payload:', payload);
            const user = await this.userService.findUserById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found.');
            }
            req.user = user;
            return true;
        }
        catch (error) {
            console.error('JWT Verification or User Retrieval Error:', error);
            throw new common_1.UnauthorizedException('Invalid or expired token or user not found');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map