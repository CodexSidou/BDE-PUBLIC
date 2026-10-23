import { UserRole, Permission } from '@/types'

// Server-enforced role permissions matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  VISITOR: [],
  STUDENT: [],
  CLASS_DELEGATE: [],
  BDE_MEMBER: [
    'view_projects',
    'view_finance_summary', // READ-ONLY investment totals and project investments
    'view_project_budget',
    'create_expense_request',
  ],
  PROJECT_MANAGER: [
    'view_projects',
    'create_projects',
    'edit_own_project',
    'manage_project_members',
    'manage_tasks',
    'create_events',
    'publish_events',
    'view_project_budget',
    'create_expense_request',
    'generate_member_badge',
    'revoke_member_badge',
  ],
  TREASURER: [
    'view_projects',
    'view_finance_summary',
    'view_project_budget',
    'view_financial_ledger',
    'create_expense_request',
    'record_transaction',
    'approve_expense', // Configurable, but cannot approve own
    'upload_financial_receipt',
    'view_audit_logs',
  ],
  VICE_PRESIDENT: [
    'view_projects',
    'create_projects',
    'edit_own_project',
    'manage_project_members',
    'manage_tasks',
    'create_events',
    'publish_events',
    'view_finance_summary',
    'view_project_budget',
    'view_financial_ledger',
    'create_expense_request',
    'record_transaction',
    'approve_expense',
    'upload_financial_receipt',
    'generate_member_badge',
    'revoke_member_badge',
    'manage_users',
    'manage_roles',
    'view_audit_logs',
    'manage_platform_settings',
  ],
  PRESIDENT: [
    'view_projects',
    'create_projects',
    'edit_own_project',
    'manage_project_members',
    'manage_tasks',
    'create_events',
    'publish_events',
    'view_finance_summary',
    'view_project_budget',
    'view_financial_ledger',
    'create_expense_request',
    'record_transaction',
    'approve_expense',
    'upload_financial_receipt',
    'generate_member_badge',
    'revoke_member_badge',
    'manage_users',
    'manage_roles',
    'view_audit_logs',
    'manage_platform_settings',
  ],
}

/**
 * Checks if a given role has a specific global permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || []
  return allowed.includes(permission)
}

/**
 * Checks if role is at least BDE Member (has access to BDE workspace)
 */
export function isBdeStaff(role: UserRole): boolean {
  return [
    'BDE_MEMBER',
    'PROJECT_MANAGER',
    'TREASURER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ].includes(role)
}

/**
 * Checks if role is administrative executive (President or Vice President)
 */
export function isExecutive(role: UserRole): boolean {
  return role === 'PRESIDENT' || role === 'VICE_PRESIDENT'
}

/**
 * Checks if role is Treasurer, VP or President (Finance Manager)
 */
export function isFinanceManager(role: UserRole): boolean {
  return ['TREASURER', 'VICE_PRESIDENT', 'PRESIDENT'].includes(role)
}

/**
 * Enforces rule: Expense requester cannot approve their own expense request!
 */
export function canApproveExpense(
  userRole: UserRole,
  userId: string,
  requesterId: string
): boolean {
  // Never approve own expense request
  if (userId === requesterId) {
    return false
  }
  return hasPermission(userRole, 'approve_expense')
}

/**
 * Checks if user has permission to manage a specific project
 */
export function canManageProject(
  userRole: UserRole,
  userId: string,
  projectManagerId: string
): boolean {
  if (isExecutive(userRole)) return true
  if (userRole === 'PROJECT_MANAGER' && userId === projectManagerId) return true
  return false
}

/**
 * Checks role hierarchy when assigning roles:
 * - Only President and Vice-President can manage roles
 * - Only President can assign/change PRESIDENT or VICE_PRESIDENT role
 * - Self-elevation is strictly forbidden
 */
export function canAssignRole(
  actorRole: UserRole,
  targetRole: UserRole,
  isSelf: boolean
): boolean {
  if (isSelf) return false // Nobody can change their own role to prevent self-elevation
  if (actorRole === 'PRESIDENT') return true
  if (actorRole === 'VICE_PRESIDENT') {
    // VP can assign roles up to TREASURER / PROJECT_MANAGER, but cannot assign PRESIDENT or VICE_PRESIDENT
    return targetRole !== 'PRESIDENT' && targetRole !== 'VICE_PRESIDENT'
  }
  return false
}
