"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthYear = void 0;
const getMonthYear = () => {
    const date = new Date();
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};
exports.getMonthYear = getMonthYear;
//# sourceMappingURL=getMonthYear.js.map