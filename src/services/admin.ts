import api from './api';
import type {
    AdminStats,
    OrganizationsResponse,
    Organization,
    UpdateOrganizationStatusRequest,
    ImpersonateUserRequest,
    ImpersonateResponse,
    ApiResponse,
    UsersResponse,
    OrganizationBillingData,
    SeatUser,
    SuperAdminUser,
    SuperAdminsResponse,
    UpdateAdminRoleRequest,
    PromoteUserRequest,
    AuditLog,
    AuditLogsResponse,
    AuditFilters,
    EarningsOverview,
    EarningsTrendPoint,
    PaymentsResponse,
    PlanDistribution,
    TopOrg,
    SeatPricing,
} from '@/types';

export const getAdminStats = async (): Promise<ApiResponse<AdminStats>> => {
    const response = await api.get('/api/admin/stats');
    return response.data;
};

export const getOrganizations = async (
    page: number = 1,
    limit: number = 10,
): Promise<ApiResponse<OrganizationsResponse>> => {
    const response = await api.get('/api/admin/organizations', {
        params: { page, limit },
    });
    return response.data;
};

export const getOrganizationDetails = async (
    id: string,
): Promise<ApiResponse<Organization>> => {
    const response = await api.get(`/api/admin/organizations/${id}`);
    return response.data;
};

export const getOrganizationBilling = async (
    id: string,
): Promise<ApiResponse<OrganizationBillingData>> => {
    const response = await api.get(`/api/admin/organizations/${id}/billing`);
    return response.data;
};

export const updateOrganizationStatus = async (
    id: string,
    data: UpdateOrganizationStatusRequest,
): Promise<ApiResponse<Organization>> => {
    const response = await api.patch(`/api/admin/organizations/${id}/status`, data);
    return response.data;
};

export const deleteOrganization = async (
    id: string,
    reason?: string,
): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/admin/organizations/${id}`, {
        data: { reason },
    });
    return response.data;
};

export const impersonateUser = async (
    userId: string,
    data: ImpersonateUserRequest,
): Promise<ApiResponse<ImpersonateResponse>> => {
    const response = await api.post(`/api/admin/impersonate/${userId}`, data);
    return response.data;
};

export const getUsers = async (
    page: number = 1,
    limit: number = 25,
    search?: string,
    accountType?: string,
    orgId?: string,
): Promise<ApiResponse<UsersResponse>> => {
    const response = await api.get('/api/admin/users', {
        params: { page, limit, search, accountType, orgId },
    });
    return response.data;
};

export const getUserDetails = async (
    id: string,
): Promise<ApiResponse<SeatUser>> => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
};

export interface UpdateUserSeatStatusRequest {
    status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
    reason?: string;
}

export const updateUserSeatStatus = async (
    id: string,
    data: UpdateUserSeatStatusRequest,
): Promise<ApiResponse<SeatUser>> => {
    const response = await api.patch(`/api/admin/users/${id}/status`, data);
    return response.data;
};

export const deleteUser = async (
    id: string,
    reason?: string,
): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/admin/users/${id}`, {
        data: { reason },
    });
    return response.data;
};

export const getProjectTrend = async (
    range: '6m' | '1y' | 'all' = '6m',
): Promise<ApiResponse<
    Array<{ date: string; projectsCreated: number; projectsArchived: number }>
>> => {
    const response = await api.get('/api/admin/project-trend', {
        params: { range },
    });
    return response.data;
};

// ==================== SuperAdmin Management ====================

export const getSuperAdmins = async (
    page: number = 1,
    limit: number = 25,
    search?: string,
    role?: string,
): Promise<ApiResponse<SuperAdminsResponse>> => {
    const response = await api.get('/api/admin/super-admins', {
        params: { page, limit, search, role },
    });
    return response.data;
};

export const getSuperAdminDetails = async (
    id: string,
): Promise<ApiResponse<SuperAdminUser>> => {
    const response = await api.get(`/api/admin/super-admins/${id}`);
    return response.data;
};

export const promoteUserToAdmin = async (
    data: PromoteUserRequest,
): Promise<ApiResponse<SuperAdminUser>> => {
    const response = await api.post('/api/admin/super-admins/promote', data);
    return response.data;
};

export const updateAdminRole = async (
    id: string,
    data: UpdateAdminRoleRequest,
): Promise<ApiResponse<SuperAdminUser>> => {
    const response = await api.patch(`/api/admin/super-admins/${id}/role`, data);
    return response.data;
};

export const suspendSuperAdmin = async (
    id: string,
    reason?: string,
): Promise<ApiResponse<SuperAdminUser>> => {
    const response = await api.patch(`/api/admin/super-admins/${id}/suspend`, {
        reason,
    });
    return response.data;
};

export const deleteSuperAdmin = async (
    id: string,
    reason?: string,
): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/admin/super-admins/${id}`, {
        data: { reason },
    });
    return response.data;
};

// ==================== Audit Trails ====================

export const getAuditLogs = async (
    page: number = 1,
    limit: number = 50,
    filters?: AuditFilters,
): Promise<ApiResponse<AuditLogsResponse>> => {
    const params: Record<string, any> = { page, limit };
    if (filters) {
        if (filters.action) params.action = filters.action;
        if (filters.performedBy) params.performedBy = filters.performedBy;
        if (filters.severity) params.severity = filters.severity;
        if (filters.targetType) params.targetType = filters.targetType;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters.dateTo) params.dateTo = filters.dateTo;
        if (filters.search) params.search = filters.search;
    }
    const response = await api.get('/api/admin/audit-logs', { params });
    return response.data;
};

export const getAuditLogDetails = async (
    id: string,
): Promise<ApiResponse<AuditLog>> => {
    const response = await api.get(`/api/admin/audit-logs/${id}`);
    return response.data;
};

export const getAuditActionsList = async (): Promise<ApiResponse<{
    actions: Array<{
        action: string;
        label: string;
        category: string;
    }>;
}>> => {
    const response = await api.get('/api/admin/audit-logs/actions');
    return response.data;
};

// ==================== Earnings & Payments ====================

export const getEarningsOverview = async (
    range: '6m' | '1y' | 'all' = '6m',
): Promise<ApiResponse<EarningsOverview>> => {
    const response = await api.get('/api/admin/earnings/overview', {
        params: { range },
    });
    return response.data;
};

export const getEarningsTrend = async (
    range: '6m' | '1y' | 'all' = '6m',
): Promise<ApiResponse<EarningsTrendPoint[]>> => {
    const response = await api.get('/api/admin/earnings/trend', {
        params: { range },
    });
    return response.data;
};

export const getPayments = async (
    page: number = 1,
    limit: number = 50,
    status?: string,
    search?: string,
): Promise<ApiResponse<PaymentsResponse>> => {
    const response = await api.get('/api/admin/earnings/payments', {
        params: { page, limit, status, search },
    });
    return response.data;
};

export const getPlanDistribution = async (): Promise<ApiResponse<PlanDistribution>> => {
    const response = await api.get('/api/admin/earnings/plan-distribution');
    return response.data;
};

export const getTopOrgs = async (): Promise<ApiResponse<TopOrg[]>> => {
    const response = await api.get('/api/admin/earnings/top-orgs');
    return response.data;
};

export const getSeatPricing = async (): Promise<ApiResponse<SeatPricing>> => {
    const response = await api.get('/api/admin/earnings/pricing');
    return response.data;
};

export const updateSeatPricing = async (
    data: Partial<SeatPricing>,
): Promise<ApiResponse<SeatPricing>> => {
    const response = await api.patch('/api/admin/earnings/pricing', data);
    return response.data;
};
