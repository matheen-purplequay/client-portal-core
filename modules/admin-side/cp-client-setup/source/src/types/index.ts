// ── Client / Company ──────────────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  works_manager_client_id: number;
  master_company_id: number;
  industry_type: string;
  client_type: string;
  dashboards: string;       // comma-separated dashboard codes
  test_dashboards: string;  // comma-separated testing dashboard codes
  updated_at?: string;
}

export interface WMClient {
  Pid: number;
  ClientName: string;
}

export interface EngagementVertical {
  wm_vertical_id: number;
  title: string;
  id: number;
  engagement_id: number;
  order_number: number;
  service_id: number;
  status?: 'new' | 'remove' | 'default';
}

export interface Vertical {
  id: number;
  wm_vertical_id: number;
  title: string;
}

// ── Users ─────────────────────────────────────────────────────────

export interface ClientUser {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  company_id: number;
  role: string;
  is_active: boolean;
  hide_in_selection: boolean;
}

export function defaultClientUser(): ClientUser {
  return {
    user_id: 0,
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    company_id: 0,
    role: '',
    is_active: true,
    hide_in_selection: false,
  };
}

export interface WMClientUser {
  cid: number;
  pid: number;
  Contactname: string;
  Emailaddress: string;
  Designation: string;
}

// ── Teams ─────────────────────────────────────────────────────────

export interface TeamsPayload {
  client_id: number;
  user_id?: number;
  wm_user_id: number;
  name: string;
  heirarchy: number;
  role_id: number;
  vertical_id: number;
  email: string;
  status: string;
}

export interface TeamsData {
  id: number;
  client_id: number;
  name: string;
  heirarchy: number;
  role: { id: number; title: string };
  vertical: { id: number; title: string };
  email: string;
  status: string;
}

export function defaultTeamsPayload(): TeamsPayload {
  return {
    client_id: 0,
    user_id: 0,
    wm_user_id: 0,
    name: '',
    role_id: 0,
    heirarchy: 0,
    vertical_id: 0,
    email: '',
    status: 'active',
  };
}

// ── Reviewers ─────────────────────────────────────────────────────

export interface Reviewer {
  id: number;
  wm_user_id: number;
  name: string;
  email: string;
}

// ── Roles ─────────────────────────────────────────────────────────

export interface Role {
  id: number;
  title: string;
  code: string;
}

// ── Rules ─────────────────────────────────────────────────────────

export interface Rule {
  id: string;
  title: string;
  value: string;
  values: Record<string, string>[];
}

export interface RuleSection {
  title: string;
  rules: Rule[];
}

// ── Dashboard ─────────────────────────────────────────────────────

export interface Dashboard {
  id: number;
  code: number;
  title: string;
}

// ── Job Status ────────────────────────────────────────────────────

export interface PrimaryJobStatus {
  Code: number;
  Name: string;
}

export interface SecondaryJobStatus {
  Code: number;
  Name: string;
}

export interface MappedStatus {
  id: number;
  primary_status: number;
  primary_status_name: string;
  secondary_status: number;
  secondary_status_name: string;
}

// ── Dropdowns ─────────────────────────────────────────────────────

export interface SelectOption {
  index: number;
  label: string;
}

// ── Auth / Storage ────────────────────────────────────────────────

export interface UserData {
  user_id: number;
  role_id: number;
  role: string;
  company_id: number;
}
