export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ProjectStats {
    total: number;
    active: number;
    archived: number;
    deleted: number;
}

export interface OrganizationStats {
    total: number;
    active: number;
}

export interface UserStats {
    total: number;
    admins: number;
    billableSeats: number;
}

export interface AdminStats {
    organizations: OrganizationStats;
    projects: ProjectStats;
    users: UserStats;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    accountType: string;
}

export interface Organization {
    _id: string;
    name: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'TRIAL';
    admin?: User;
    activeSeatCount: number;
    projectCount?: number;
    userCount?: number;
    coreSeats?: number;
    trackerSeats?: number;
    industry?: string;
    description?: string;
    companyWebsite?: string;
    logo?: string;
    seatBillingStatus?: string;
    stripeSubscriptionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface OrganizationsResponse {
    organizations: Organization[];
    pagination: Pagination;
}

export interface ImpersonateResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        accountType: string;
    };
}

export interface ImpersonateUserRequest {
    duration?: number;
    reason?: string;
}

export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'TRIAL';
export type AccountType = 'CLIENT' | 'GUEST' | 'CONTACT' | 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT_ADMIN' | 'AUDIT_ADMIN';
export type SeatStatus = 'ACTIVE' | 'SUSPENDED' | 'REMOVED';

export interface UpdateOrganizationStatusRequest {
    status: OrganizationStatus;
    reason?: string;
}

export interface SeatBillingTier {
    seats: number;
    pricePerSeat: number;
    total: number;
}

export interface SeatBillingData {
    subscriptionId: string | null;
    billingStatus: string;
    tiers: {
        recruitPremium: SeatBillingTier;
        recruitStandard: SeatBillingTier;
        trackerPremium: SeatBillingTier;
        trackerStandard: SeatBillingTier;
    };
    totalMonthly: number;
}

export interface AICreditsData {
    subscriptionTier: string;
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
    purchasedCredits: number;
    rolloverCredits: number;
    stripeSubscriptionId: string | null;
}

export interface InvoiceRecord {
    id: string;
    date: string;
    amount: number;
    status: string;
    paymentIntentId: string;
    description: string;
}

export interface OrganizationBillingData {
    seatBilling: SeatBillingData;
    aiCredits: AICreditsData | null;
    invoiceHistory: InvoiceRecord[];
}

export interface SeatUser {
    _id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    accountType: AccountType;
    profile_img?: string;
    isOnline?: boolean;
    lastActive?: string;
    createdAt: string;
    organization?: {
        _id: string;
        name: string;
    } | null;
    role?: string;
    seatStatus: SeatStatus;
    appAccess?: string[];
    source?: 'core' | 'tracker';
}

export interface UsersResponse {
    users: SeatUser[];
    pagination: Pagination;
}

// ==================== SuperAdmin & Role Management ====================

export type AdminRole = 'SUPER_ADMIN' | 'SUPPORT_ADMIN' | 'AUDIT_ADMIN';
export type AdminPermission =
    | 'manage_organizations'
    | 'manage_users'
    | 'manage_projects'
    | 'manage_roles'
    | 'manage_billing'
    | 'impersonate_users'
    | 'view_audit_logs'
    | 'manage_system_settings'
    | 'manage_super_admins';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
    SUPER_ADMIN: [
        'manage_organizations',
        'manage_users',
        'manage_projects',
        'manage_roles',
        'manage_billing',
        'impersonate_users',
        'view_audit_logs',
        'manage_system_settings',
        'manage_super_admins',
    ],
    AUDIT_ADMIN: [
        'view_audit_logs',
        'manage_organizations',
        'manage_users',
        'manage_projects',
    ],
    SUPPORT_ADMIN: [
        'manage_organizations',
        'manage_users',
        'manage_projects',
        'impersonate_users',
        'manage_billing',
    ],
};

export interface AdminRoleConfig {
    role: AdminRole;
    label: string;
    description: string;
    color: string;
    permissions: AdminPermission[];
}

export const ADMIN_ROLES_CONFIG: AdminRoleConfig[] = [
    {
        role: 'SUPER_ADMIN',
        label: 'Super Admin',
        description: 'Full system access including role management and audit trails',
        color: '#9C27B0',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
    },
    {
        role: 'AUDIT_ADMIN',
        label: 'Audit Admin',
        description: 'Access to audit logs and read/modify organizations, users, projects',
        color: '#607D8B',
        permissions: ROLE_PERMISSIONS.AUDIT_ADMIN,
    },
    {
        role: 'SUPPORT_ADMIN',
        label: 'Support Admin',
        description: 'Can manage orgs, users, projects, impersonate, and handle billing',
        color: '#00BCD4',
        permissions: ROLE_PERMISSIONS.SUPPORT_ADMIN,
    },
];

export interface SuperAdminUser {
    _id: string;
    name: string;
    email: string;
    accountType: AdminRole;
    profile_img?: string;
    permissions: AdminPermission[];
    isOnline?: boolean;
    lastActive?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
}

export interface SuperAdminsResponse {
    admins: SuperAdminUser[];
    pagination: Pagination;
}

export interface UpdateAdminRoleRequest {
    role: AdminRole;
    reason: string;
}

export interface PromoteUserRequest {
    userId: string;
    role: AdminRole;
    reason: string;
}

// ==================== Audit Trails ====================

export type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE_ORGANIZATION'
    | 'UPDATE_ORGANIZATION'
    | 'DELETE_ORGANIZATION'
    | 'SUSPEND_ORGANIZATION'
    | 'ACTIVATE_ORGANIZATION'
    | 'CREATE_USER'
    | 'UPDATE_USER'
    | 'DELETE_USER'
    | 'SUSPEND_USER'
    | 'ACTIVATE_USER'
    | 'CHANGE_USER_ROLE'
    | 'CHANGE_ADMIN_ROLE'
    | 'IMPERSONATE_USER'
    | 'UPDATE_BILLING'
    | 'UPDATE_SETTINGS'
    | 'CREATE_SUPER_ADMIN'
    | 'DELETE_SUPER_ADMIN'
    | 'SYSTEM_UPDATE';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export const ACTION_SEVERITY_MAP: Record<AuditAction, AuditSeverity> = {
    LOGIN: 'info',
    LOGOUT: 'info',
    CREATE_ORGANIZATION: 'info',
    UPDATE_ORGANIZATION: 'info',
    DELETE_ORGANIZATION: 'critical',
    SUSPEND_ORGANIZATION: 'warning',
    ACTIVATE_ORGANIZATION: 'info',
    CREATE_USER: 'info',
    UPDATE_USER: 'info',
    DELETE_USER: 'critical',
    SUSPEND_USER: 'warning',
    ACTIVATE_USER: 'info',
    CHANGE_USER_ROLE: 'warning',
    CHANGE_ADMIN_ROLE: 'critical',
    IMPERSONATE_USER: 'warning',
    UPDATE_BILLING: 'info',
    UPDATE_SETTINGS: 'info',
    CREATE_SUPER_ADMIN: 'critical',
    DELETE_SUPER_ADMIN: 'critical',
    SYSTEM_UPDATE: 'info',
};

export interface AuditLog {
    _id: string;
    action: AuditAction;
    performedBy: {
        _id: string;
        name: string;
        email: string;
        accountType: AccountType | AdminRole;
    };
    target?: {
        type: 'user' | 'organization' | 'project' | 'system' | 'admin';
        id: string;
        name?: string;
    };
    details: {
        summary: string;
        changes?: Record<string, { old: any; new: any }>;
        metadata?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    };
    severity: AuditSeverity;
    timestamp: string;
}

export interface AuditLogsResponse {
    logs: AuditLog[];
    pagination: Pagination;
}

export interface AuditFilters {
    action?: AuditAction;
    performedBy?: string;
    severity?: AuditSeverity;
    targetType?: 'user' | 'organization' | 'project' | 'system' | 'admin';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

// ==================== Earnings & Payments ====================

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'overdue' | 'unknown';

export interface EarningsOverview {
    mrr: number;
    totalCollected: number;
    pending: number;
    overdue: number;
    totalInvoices: number;
    avgInvoiceValue: number;
    activeOrgs: number;
}

export interface EarningsTrendPoint {
    month: string;
    orgsCreated: number;
    expectedRevenue: number;
}

export interface PaymentRecord {
    _id: string;
    organization: {
        _id: string;
        name: string;
    };
    activeSeats: number;
    status: PaymentStatus;
    stripeSubscriptionId: string | null;
    description: string;
    date: string;
    expectedEarnings: number;
    pricingPerSeat: number;
}

export interface SeatPricing {
    recruitStandard: number;
    recruitPremium: number;
    trackerStandard: number;
    trackerPremium: number;
}

export interface PaymentsResponse {
    payments: PaymentRecord[];
    pagination: Pagination;
}

export interface PlanDistribution {
    recruitOnly: number;
    trackerOnly: number;
    both: number;
    totalOrgsWithSeats: number;
}

export interface TopOrg {
    organization: {
        _id: string;
        name: string;
    };
    activeSeats: number;
    status: string;
    expectedEarnings: number;
}
