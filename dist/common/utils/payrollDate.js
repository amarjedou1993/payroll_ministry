"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthYear = getMonthYear;
function getMonthYear() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}-${year}`;
}
//# sourceMappingURL=payrollDate.js.map