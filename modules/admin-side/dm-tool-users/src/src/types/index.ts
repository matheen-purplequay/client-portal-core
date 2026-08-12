// ── Roles ─────────────────────────────────────────────────────────

export interface Role {
  id: number;
  title: string;
  code: string;
}

// ── Portal user (existing internal user) ──────────────────────────

export interface PortalUser {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  wm_user_id?: number;
  wm_user_employee_id?: number;
  staff_id?: number;
}

// ── Works Manager internal user ───────────────────────────────────

export interface WMInternalUser {
  Uid: number;
  Firstname: string;
  Lastname: string;
  NewOfficialEmailID: string;
  NewEmworks_manager_client_id: number;
}

// ── Generate-access payload sent to backend ───────────────────────

export interface GenerateInternalAccessPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  staff_id: number;
  wm_user_id: number;
  wm_user_employee_id: number;
  company_id: number;
  role: string;
}

// ── Auth / Storage ────────────────────────────────────────────────

export interface UserData {
  user_id: number;
  role_id: number;
  role: string;
  company_id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  staff_id?: number;
  [key: string]: unknown;
}
