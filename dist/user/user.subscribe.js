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
exports.UserSubscriber = void 0;
const typeorm_1 = require("typeorm");
const payroll_entity_1 = require("../payroll/entities/payroll.entity");
const user_entity_1 = require("./entities/user.entity");
let UserSubscriber = class UserSubscriber {
    constructor(dataSource) {
        dataSource.subscribers.push(this);
    }
    listenTo() {
        return user_entity_1.User;
    }
    async beforeUpdate(event) {
        const prev = event.databaseEntity;
        const next = event.entity;
        if (prev && next && prev.employeeId !== next.employeeId) {
            await event.manager.delete(payroll_entity_1.Payroll, { user: { id: next.id } });
        }
    }
};
exports.UserSubscriber = UserSubscriber;
exports.UserSubscriber = UserSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], UserSubscriber);
//# sourceMappingURL=user.subscribe.js.map