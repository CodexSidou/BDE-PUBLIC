export type UserRole =
  | 'VISITOR'
  | 'STUDENT'
  | 'CLASS_DELEGATE'
  | 'BDE_MEMBER'
  | 'PROJECT_MANAGER'
  | 'TREASURER'
  | 'VICE_PRESIDENT'
  | 'PRESIDENT'

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  studentNumber?: string | null
  department?: string | null
  studyYear?: string | null
  avatarUrl?: string | null
}

export type Permission =
  | 'view_projects'
  | 'create_projects'
  | 'edit_own_project'
  | 'manage_project_members'
  | 'manage_tasks'
  | 'create_events'
  | 'publish_events'
  | 'view_finance_summary'
  | 'view_project_budget'
  | 'view_financial_ledger'
  | 'create_expense_request'
  | 'record_transaction'
  | 'approve_expense'
  | 'upload_financial_receipt'
  | 'generate_member_badge'
  | 'revoke_member_badge'
  | 'manage_users'
  | 'manage_roles'
  | 'view_audit_logs'
  | 'manage_platform_settings'

export interface FinancialSummary {
  openingBalance: number
  totalIncome: number
  totalPaidExpenses: number
  availableBalance: number
  totalReservedBudgets: number
  pendingExpensesCount: number
  pendingExpensesTotal: number
  approvedUnpaidTotal: number
  projectInvestments: {
    projectId: string
    projectTitle: string
    allocatedBudget: number
    totalInvested: number
  }[]
}
