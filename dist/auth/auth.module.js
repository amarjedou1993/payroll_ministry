"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const config_1 = require("@nestjs/config");
const auth_config_1 = require("../common/config/auth.config");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const user_module_1 = require("../user/user.module");
const jwt_auth_guard_1 = require("./guard/jwt-auth.guard");
const local_strategy_1 = require("./strategies/local.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const local_auth_guard_1 = require("./guard/local-auth.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(auth_config_1.default),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule.forFeature(auth_config_1.default)],
                useFactory: async (configService) => ({
                    secret: configService.get('auth.jwtSecret'),
                    signOptions: {
                        expiresIn: configService.get('auth.jwtExpiration'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            local_strategy_1.LocalStrategy,
            jwt_strategy_1.JwtStrategy,
            local_auth_guard_1.LocalAuthGuard,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [jwt_auth_guard_1.JwtAuthGuard, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map