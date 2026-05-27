import { hasPermission, getUserRole } from "../utils/permissions";

export default function usePermission() {
  const role = getUserRole();
  const can = (permission) => hasPermission(permission);
  return { role, can };
}