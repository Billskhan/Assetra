"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANAGER_ROLES = exports.ADMIN_ROLES = void 0;
const client_1 = require("@prisma/client");
exports.ADMIN_ROLES = [client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER];
exports.MANAGER_ROLES = [
    client_1.Role.ADMIN,
    client_1.Role.PROJECT_MANAGER,
    client_1.Role.MANAGER
];
//# sourceMappingURL=roles.js.map