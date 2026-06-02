// El modelo RBAC (PERMISSIONS + can) vive en @fleetops/types como fuente única
// compartida con el backend. Se re-exporta acá para no tocar los consumidores
// existentes (usePermission, etc.).
export { PERMISSIONS, can } from "@fleetops/types";
