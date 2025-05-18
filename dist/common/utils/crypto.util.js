"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt = require("bcrypt");
const hashPassword = (password) => {
    return bcrypt.hash(password, 12);
};
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=crypto.util.js.map