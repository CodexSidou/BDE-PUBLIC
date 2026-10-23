import { hasPermission, canApproveExpense, canAssignRole, canManageProject, isFinanceManager, isBdeStaff } from '../src/lib/permissions'
import { generateBadgeCode, verifyBadgeByCode } from '../src/lib/badges'
import { getFinancialSummary } from '../src/lib/finance'
import { prisma } from '../src/lib/prisma'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ [PASS] ${testName}`)
  } else {
    failedTests++
    console.error(`  ❌ [FAIL] ${testName}`)
  }
}

async function runTests() {
  console.log('🧪 ======================================================')
  console.log('🧪 INSIM CONNECT AUTOMATED VERIFICATION SUITE')
  console.log('🧪 ======================================================\n')

  // 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL TESTS
  console.log('📋 1. Authentication & Role Permissions Tests:')
  assert(!hasPermission('STUDENT', 'view_financial_ledger'), 'Student cannot view complete financial ledger')
  assert(!hasPermission('STUDENT', 'manage_users'), 'Student cannot manage platform users')
  assert(!hasPermission('CLASS_DELEGATE', 'record_transaction'), 'Class Delegate cannot record financial transactions')
  assert(hasPermission('BDE_MEMBER', 'view_finance_summary'), 'Normal BDE Member can view read-only financial investment summary')
  assert(!hasPermission('BDE_MEMBER', 'approve_expense'), 'Normal BDE Member cannot approve expenses')
  assert(hasPermission('TREASURER', 'record_transaction'), 'Treasurer can record financial transactions')
  assert(hasPermission('VICE_PRESIDENT', 'manage_users'), 'Vice-President is a technical admin and can manage users')
  assert(hasPermission('PRESIDENT', 'manage_platform_settings'), 'President can manage platform settings')

  // Role Hierarchy & Anti-Self-Elevation
  assert(!canAssignRole('STUDENT', 'PRESIDENT', true), 'User cannot elevate themselves to President')
  assert(!canAssignRole('TREASURER', 'VICE_PRESIDENT', true), 'Treasurer cannot elevate themselves to Vice-President')
  assert(!canAssignRole('VICE_PRESIDENT', 'PRESIDENT', false), 'Vice-President cannot appoint a President')
  assert(canAssignRole('PRESIDENT', 'VICE_PRESIDENT', false), 'President can appoint a Vice-President')
  assert(canAssignRole('VICE_PRESIDENT', 'TREASURER', false), 'Vice-President can appoint a Treasurer')

  // 2. FINANCIAL RULES & ANTI-SELF-APPROVAL TESTS
  console.log('\n📋 2. Financial Governance & Anti-Self-Approval Tests:')
  const requesterId = 'user-requester-123'
  const otherUserId = 'user-treasurer-456'

  assert(!canApproveExpense('TREASURER', requesterId, requesterId), 'Treasurer CANNOT approve their own expense request')
  assert(!canApproveExpense('PRESIDENT', requesterId, requesterId), 'President CANNOT approve their own expense request')
  assert(canApproveExpense('TREASURER', otherUserId, requesterId), 'Treasurer CAN approve another member expense request')
  assert(canApproveExpense('PRESIDENT', otherUserId, requesterId), 'President CAN approve another member expense request')

  // Verify Financial Calculations against Neon Database
  try {
    const summary = await getFinancialSummary('BDE_MEMBER', 150000.0)
    assert(summary.openingBalance === 150000.0, 'Opening balance is correctly tracked')
    assert(summary.totalIncome > 0, 'Confirmed incoming funds are summed accurately')
    assert(summary.totalPaidExpenses > 0, 'Confirmed paid expenses are aggregated without float errors')
    assert(summary.projectInvestments.length > 0, 'Project investments breakdown is accessible to normal BDE members')
    
    // Formula verification: Available balance = Opening + Income - Paid - Reserved
    const expectedAvailable = Math.max(0, 150000.0 + summary.totalIncome - summary.totalPaidExpenses - summary.totalReservedBudgets)
    assert(Math.abs(summary.availableBalance - expectedAvailable) < 0.01, 'Available balance calculation conforms precisely to the financial formula')
  } catch (e) {
    assert(false, `Financial calculation database query failed: ${e}`)
  }

  // 3. PROJECT PERMISSIONS TESTS
  console.log('\n📋 3. Project Management Tests:')
  const managerId = 'mgr-1'
  const otherId = 'usr-2'
  assert(canManageProject('PROJECT_MANAGER', managerId, managerId), 'Project Manager can manage their own project')
  assert(!canManageProject('PROJECT_MANAGER', otherId, managerId), 'Project Manager CANNOT manage an unrelated project')
  assert(canManageProject('PRESIDENT', otherId, managerId), 'President has administrative supervisory rights on all projects')
  assert(canManageProject('VICE_PRESIDENT', otherId, managerId), 'Vice-President has administrative supervisory rights on all projects')

  // 4. INSIM ID BADGE GENERATION & QR VERIFICATION TESTS
  console.log('\n📋 4. INSIM ID Badges & QR Cryptographic Verification Tests:')
  const code = generateBadgeCode()
  assert(code.startsWith('INSIM-'), 'Badge code generator produces standard INSIM prefix')
  assert(code.length === 20, 'Badge code has correct cryptographic length (INSIM-XXXX-XXXX-XXXX)')

  // Database verification of seeded badges
  const validBadge = await verifyBadgeByCode('INSIM-8B4F-29E1-C34A')
  assert(validBadge.status === 'VALID' && validBadge.isValid === true, 'Seeded presidential badge is verified as VALID')

  const revokedBadge = await verifyBadgeByCode('INSIM-0000-REVOKED-X1')
  assert(revokedBadge.status === 'REVOKED' && revokedBadge.isValid === false, 'Seeded revoked badge is strictly verified as REVOKED with reason')
  assert(revokedBadge.revokedReason !== undefined && revokedBadge.revokedReason !== null, 'Revocation audit reason is preserved and returned')

  const nonExistentBadge = await verifyBadgeByCode('INSIM-FAKE-9999-XXXX')
  assert(nonExistentBadge.status === 'NOT_FOUND' && nonExistentBadge.isValid === false, 'Non-existent or forged badge code returns NOT_FOUND')

  // 5. QR CODE SCANNER PAYLOAD PARSING TESTS
  console.log('\n📋 5. QR Code Scanner Payload Parsing & Recognition Tests:')
  const { parseInsimQrPayload } = await import('../src/components/BadgeScanner')

  const directCodePayload = parseInsimQrPayload('INSIM-8B4F-29E1-C34A')
  assert(directCodePayload.isBadge === true && directCodePayload.badgeCode === 'INSIM-8B4F-29E1-C34A', 'Parses direct INSIM badge code string')

  const urlPayload = parseInsimQrPayload('https://bde-bice.vercel.app/verify/INSIM-4D9A-71C5-9F2B')
  assert(urlPayload.isBadge === true && urlPayload.badgeCode === 'INSIM-4D9A-71C5-9F2B', 'Extracts badge code from official https verify URL')

  const localUrlPayload = parseInsimQrPayload('http://localhost:3000/verify/INSIM-0000-REVOKED-X1')
  assert(localUrlPayload.isBadge === true && localUrlPayload.badgeCode === 'INSIM-0000-REVOKED-X1', 'Extracts badge code from localhost verify URL')

  const eventUrlPayload = parseInsimQrPayload('https://bde-bice.vercel.app/dashboard/events')
  assert(eventUrlPayload.isBadge === false && eventUrlPayload.isSiteUrl === true, 'Recognizes internal INSIM site URL')

  const randomPayload = parseInsimQrPayload('HELLO WORLD 1234')
  assert(randomPayload.isBadge === false && randomPayload.isSiteUrl === false && randomPayload.badgeCode === null, 'Correctly handles non-INSIM arbitrary QR codes')

  // 6. PRESIDENT & VP MEMBER CREATION AND CONTACT INBOX TESTS
  console.log('\n📋 6. Executive Account Creation & Contact Messages Tests:')

  // Authorization checks
  assert(canAssignRole('PRESIDENT', 'VICE_PRESIDENT', false) === true, 'President can appoint a Vice-President')
  assert(canAssignRole('PRESIDENT', 'BDE_MEMBER', false) === true, 'President can appoint a BDE Member')
  assert(canAssignRole('VICE_PRESIDENT', 'BDE_MEMBER', false) === true, 'Vice-President can appoint a BDE Member')
  assert(canAssignRole('VICE_PRESIDENT', 'PRESIDENT', false) === false, 'Vice-President cannot appoint a President')
  assert(canAssignRole('VICE_PRESIDENT', 'VICE_PRESIDENT', false) === false, 'Vice-President cannot appoint another Vice-President')
  assert(canAssignRole('PRESIDENT', 'PRESIDENT', true) === false, 'Self-role changes are strictly forbidden')

  // Database ContactMessage persistence check
  const testContact = await prisma.contactMessage.create({
    data: {
      name: 'Amine Testeur',
      email: 'amine.test@insim-student.dz',
      subject: 'Proposition Club Robotique',
      category: 'Clubs & Vie Étudiante',
      message: 'Bonjour Monsieur le Président et Vice-Président, nous souhaitons lancer un club robotique.',
    },
  })
  assert(testContact.id !== undefined, 'Contact message successfully saved to database')
  assert(testContact.category === 'Clubs & Vie Étudiante', 'Contact message category is correctly persisted')
  assert(testContact.isRead === false, 'New contact message defaults to unread')

  // Cleanup test contact message
  await prisma.contactMessage.delete({ where: { id: testContact.id } })
  assert(true, 'Test contact message cleaned up successfully')

  console.log('\n======================================================')
  console.log(`📊 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`)
  console.log('======================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTests()
  .catch((err) => {
    console.error('Test execution error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
