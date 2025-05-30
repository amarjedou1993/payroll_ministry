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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const role_module_1 = require("./role/role.module");
const payroll_module_1 = require("./payroll/payroll.module");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const pdf_module_1 = require("./pdf/pdf.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const typeorm_1 = require("typeorm");
const user_subscribe_1 = require("./user/user.subscribe");
const database_config_1 = require("./common/config/database.config");
let AppModule = class AppModule {
    constructor(dataSource) {
        this.dataSource = dataSource;
        new user_subscribe_1.UserSubscriber(this.dataSource);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default],
                envFilePath: '.env',
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            role_module_1.RoleModule,
            payroll_module_1.PayrollModule,
            database_module_1.DatabaseModule,
            pdf_module_1.PdfModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
        ],
    }),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AppModule);
//# sourceMappingURL=app.module.js.map