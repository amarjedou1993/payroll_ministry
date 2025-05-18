"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePayrollDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const upload_payroll_dto_1 = require("./upload-payroll.dto");
class UpdatePayrollDto extends (0, mapped_types_1.PartialType)(upload_payroll_dto_1.UploadPayrollDto) {
}
exports.UpdatePayrollDto = UpdatePayrollDto;
//# sourceMappingURL=update-payroll.dto.js.map