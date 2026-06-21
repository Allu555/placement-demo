import { RoleType } from '@prisma/client';

export type Permission =
  | 'user:manage'
  | 'profile:read-all'
  | 'profile:read-own'
  | 'profile:write-own'
  | 'profile:verify'
  | 'job:create'
  | 'job:read'
  | 'job:update'
  | 'job:delete'
  | 'application:apply'
  | 'application:read-own'
  | 'application:read-all'
  | 'application:update-status'
  | 'interview:schedule'
  | 'interview:update-feedback'
  | 'offer:create'
  | 'offer:update-status'
  | 'analytics:view'
  | 'settings:manage';

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  SUPER_ADMIN: [
    'user:manage',
    'profile:read-all',
    'profile:read-own',
    'profile:write-own',
    'profile:verify',
    'job:create',
    'job:read',
    'job:update',
    'job:delete',
    'application:apply',
    'application:read-own',
    'application:read-all',
    'application:update-status',
    'interview:schedule',
    'interview:update-feedback',
    'offer:create',
    'offer:update-status',
    'analytics:view',
    'settings:manage',
  ],
  ADMIN: [
    'user:manage',
    'profile:read-all',
    'profile:read-own',
    'profile:write-own',
    'profile:verify',
    'job:create',
    'job:read',
    'job:update',
    'job:delete',
    'application:read-all',
    'application:update-status',
    'interview:schedule',
    'interview:update-feedback',
    'offer:create',
    'offer:update-status',
    'analytics:view',
  ],
  PLACEMENT_OFFICER: [
    'profile:read-all',
    'profile:verify',
    'job:create',
    'job:read',
    'job:update',
    'job:delete',
    'application:read-all',
    'application:update-status',
    'interview:schedule',
    'interview:update-feedback',
    'offer:create',
    'offer:update-status',
    'analytics:view',
  ],
  DEPT_COORDINATOR: [
    'profile:read-all',
    'job:read',
    'application:read-all',
    'analytics:view',
  ],
  STUDENT: [
    'profile:read-own',
    'profile:write-own',
    'job:read',
    'application:apply',
    'application:read-own',
  ],
  RECRUITER: [
    'profile:read-all',
    'job:create',
    'job:read',
    'job:update',
    'application:read-all',
    'application:update-status',
    'interview:schedule',
    'offer:create',
  ],
  HR: [
    'profile:read-all',
    'job:create',
    'job:read',
    'job:update',
    'application:read-all',
    'application:update-status',
    'interview:schedule',
    'offer:create',
  ],
  INTERVIEWER: [
    'profile:read-all',
    'job:read',
    'application:read-all',
    'interview:update-feedback',
  ],
  GUEST: [
    'job:read',
  ],
};

/**
 * Validates if a user role has the required permission.
 */
export function hasPermission(role: RoleType, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}
