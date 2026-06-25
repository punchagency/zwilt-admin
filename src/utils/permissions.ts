import { AdminPermission, AdminRole, ROLE_PERMISSIONS } from '@/types';

export const hasPermission = (
    user: { systemRole?: string } | null | undefined,
    permission: AdminPermission,
): boolean => {
    if (!user || !user.systemRole) return false;
    const role = user.systemRole as AdminRole;
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
};
