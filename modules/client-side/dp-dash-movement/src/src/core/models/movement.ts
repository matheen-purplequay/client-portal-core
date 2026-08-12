export interface JobHeader {
  id: string;
  label: string;
}

export interface OBSDashboardFilter {
  received_from?: string;
  accountant?: string;
  status_id?: number;
  financial_year?: string;
  nature_of_job?: string;
  received_date_range?: { from: string; to: string };
  commenced_date_range?: { from: string; to: string };
}

export interface BKDashboardFilter {
  received_from?: string;
  accountant?: string;
  status_id?: number;
  financial_year?: string;
  nature_of_job?: string;
  received_date_range?: { from: string; to: string };
  commenced_date_range?: { from: string; to: string };
}

export interface FPDashboardFilter {
  received_from?: string;
  accountant?: string;
  status_id?: number;
  financial_year?: string;
  nature_of_job?: string;
  received_date_range?: { from: string; to: string };
  commenced_date_range?: { from: string; to: string };
}

export interface SMSFDashboardFilter {
  received_from?: string;
  accountant?: string;
  status_id?: number;
  financial_year?: string;
  nature_of_job?: string;
  received_date_range?: { from: string; to: string };
  commenced_date_range?: { from: string; to: string };
}

export interface MovementFilter {
  key: string;
  title: string;
  isSelected?: boolean;
  values: string[];
  selectedValue?: string;
  filterType: "simple" | "advanced" | "badge";
  filterSelected?: (option: string | null) => void;
}

export interface JobTitle {
  id?: number;
  key: string;
  title: string;
  titleClass?: string;
  valueClass?: string;
  className?: string;
}

export interface StatusCount {
  id?: number;
  key: string;
  title: string;
  value: number;
  titleClass?: string;
  valueClass?: string;
  className?: string;
}

export interface OBSJobRowData {
  Aid: string;
  GroupJobName: string;
  Jobname: string;
  Location: string;
  Naturejob: string;
  ReceivedFrom: string;
  Partner: string;
  Accountant: string;
  Workstatus: string;
  StatusId: number;
  financial_year: string;
  ReceivedDate: string;
  CommencedDate: string;
  QuerySentDate: string;
  QueryRepliesReceivedDate: string;
  InternalReviewSentDate: string;
  ReviewSentDate: string;
  ReviewRepliesReceivedDate: string;
  FinalReviewSentDate: string;
  ClosedDate: string;
  TimeTakenTillDate: string;
  TotalBudget: string;
  UnderOverBudget: string;
  Amount: string;
  Hours: string;
  PriorityDate: string;
  BudgetAlertDate: string;
  Remarks: string;
}

export interface BKJobRowData {
  Aid: string;
  GroupJobName: string;
  Jobname: string;
  Location: string;
  Naturejob: string;
  ReceivedFrom: string;
  Partner: string;
  Accountant: string;
  Workstatus: string;
  StatusId: number;
  ReceivedDate: string;
  CommencedDate: string;
  QuerySentDate: string;
  QueryRepliesReceivedDate: string;
  InternalReviewSentDate: string;
  ReviewSentDate: string;
  ReviewRepliesReceivedDate: string;
  FinalReviewSentDate: string;
  PriorityDate: string;
  BudgetAlertDate: string;
}

export interface SMSFJobRowData {
  Aid: string;
  GroupJobName: string;
  Jobname: string;
  Location: string;
  Naturejob: string;
  ReceivedFrom: string;
  Partner: string;
  Accountant: string;
  Workstatus: string;
  StatusId: number;
  ReceivedDate: string;
  CommencedDate: string;
  QuerySentDate: string;
  QueryRepliesReceivedDate: string;
  InternalReviewSentDate: string;
  ReviewSentDate: string;
  ReviewRepliesReceivedDate: string;
  FinalReviewSentDate: string;
  PriorityDate: string;
  BudgetAlertDate: string;
}

export interface FPJobRowData {
  Aid: string;
  GroupJobName: string;
  Jobname: string;
  Location: string;
  Naturejob: string;
  ReceivedFrom: string;
  Partner: string;
  Accountant: string;
  Workstatus: string;
  StatusId: number;
  ReceivedDate: string;
  CommencedDate: string;
  QuerySentDate: string;
  QueryRepliesReceivedDate: string;
  InternalReviewSentDate: string;
  ReviewSentDate: string;
  ReviewRepliesReceivedDate: string;
  FinalReviewSentDate: string;
  PriorityDate: string;
  BudgetAlertDate: string;
}