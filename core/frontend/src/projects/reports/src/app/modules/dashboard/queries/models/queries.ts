import { SimpleTab } from "pq-ui";


export interface MasterFilterMeta {
	index: number;
	code: string;
	label: string;
	values: MasterFilter[];
};

export class MasterFilterMeta {
	static defaultMasterFilterMeta() {
		return {
			index: 0,
			code: "",
			label: "",
			values: [],
		} as MasterFilterMeta;
	}
}

export interface MasterFiltersMeta {
	category: {
		list: MasterFilter[],
		selected: QueryFilter,
		keys: MasterFilterKeys
	};
	sub_category: {
		list: MasterFilter[],
		selected: QueryFilter,
		keys: MasterFilterKeys
	};
	criticality: {
		list: MasterFilter[],
		selected: QueryFilter,
		keys: MasterFilterKeys
	};
	query_status: {
		list: MasterFilter[],
		selected: QueryFilter,
		keys: MasterFilterKeys
	};
	response_type: {
		list: MasterFilter[],
		selected: QueryFilter,
		keys: MasterFilterKeys
	}
	processing_stage: {
		list: MasterFilter[],
		selected: QueryFilter,
		keys: MasterFilterKeys
	}
}

export class MasterFiltersMeta {
	static defaultMasterFiltersMeta() {
		return {
			category: {
				list: [],
				selected: QueryFilter.defaultQueryFilter('category'),
				keys: MasterFilterKeys
			},
			sub_category: {
				list: [],
				selected: QueryFilter.defaultQueryFilter('sub_category'),
				keys: MasterFilterKeys
			},
			criticality: {
				list: [],
				selected: QueryFilter.defaultQueryFilter('criticality'),
				keys: MasterFilterKeys
			},
			query_status: {
				list: [],
				selected: QueryFilter.defaultQueryFilter('query_status'),
				keys: MasterFilterKeys
			},
			response_type: {
				list: [],
				selected: QueryFilter.defaultQueryFilter('response_type'),
				keys: MasterFilterKeys
			},
			processing_stage: {
				list: [],
				selected: QueryFilter.defaultQueryFilter('processing_stage'),
				keys: MasterFilterKeys
			},
		} as MasterFiltersMeta;
	}
}



export interface MasterFilter {
	id: number;
	master_name: string;
	master_code: string
}

export class MasterFilter {
	static defaultMasterFilter() {
		return {
			id: 0, master_code: '', master_name: ''
		} as MasterFilter;
	}
}

export interface MasterFilterKeys {
	key: string; value: string;
}

export const MasterFilterKeys = {
	key: 'id', value: 'master_name'
}

export const MAX_ATTACHMENT_LIMIT = 5;
export const MAX_QUERY_LIMIT = 5;

export const QUERYSTATUS: MasterFilter[] = [
	{ id: 3, master_name: 'Open', master_code: 'open' },
	{ id: 4, master_name: 'Responded', master_code: 'responded' },
	{ id: 5, master_name: 'Resolved', master_code: 'resolved' },
	{ id: 6, master_name: 'Closed', master_code: 'closed' },
];

export const QUERYSTATUSFILTER: MasterFilter[] = [
	{ id: 0, master_name: 'All', master_code: 'all' },
	{ id: 3, master_name: 'Open', master_code: 'open' },
	{ id: 4, master_name: 'Responded', master_code: 'responded' },
	{ id: 5, master_name: 'Resolved', master_code: 'resolved' },
	{ id: 6, master_name: 'Closed', master_code: 'closed' },
];

export const CRITICALITIES: any = [
	{ id: 1, master_name: 'High', master_code: 'high', level: 'criticality c4' },
	{ id: 2, master_name: 'Medium', master_code: 'medium', level: 'criticality c3' },
	{ id: 3, master_name: 'Low', master_code: 'low', level: 'criticality c2' },
	{ id: 4, master_name: 'Normal', master_code: 'normal', level: 'criticality c1' }
];

export const CRITICALITIESFILTER: any = [
	{ id: 0, master_name: 'All', master_code: 'all', level: 'criticality c4' },
	{ id: 1, master_name: 'High', master_code: 'high', level: 'criticality c4' },
	{ id: 2, master_name: 'Medium', master_code: 'medium', level: 'criticality c3' },
	{ id: 3, master_name: 'Low', master_code: 'low', level: 'criticality c2' },
	{ id: 4, master_name: 'Normal', master_code: 'normal', level: 'criticality c1' }
];

export const CATEGORIES: MasterFilter[] = [
	{ id: 0, master_code: 'income', master_name: 'Income' },
	{ id: 1, master_code: 'expenses', master_name: 'Expenses' },
	{ id: 2, master_code: 'assets', master_name: 'Assets' },
	{ id: 3, master_code: 'liabilities', master_name: 'Liabilities' }
];

export const CATEGORIESFILTER: MasterFilter[] = [
	{ id: 0, master_code: 'all', master_name: 'All' },
	{ id: 0, master_code: 'income', master_name: 'Income' },
	{ id: 0, master_code: 'expenses', master_name: 'Expenses' },
	{ id: 0, master_code: 'assets', master_name: 'Assets' },
	{ id: 0, master_code: 'liabilities', master_name: 'Liabilities' }
];

export const SUBCATEGORIES: { [key: string]: string[] } = {
	income: ['Capital Gains', 'Distributions', 'Dividends', 'Employer Contributions', 'Interest Received', 'Concessional Contributions', 'Non Concessional COntributions', 'Interest Received', 'Other Income', 'Rental Income', 'Transfer In/Roll Over'],
	expenses: ['Accountancy Fees', 'Asic Fees', 'Audit Fees', 'Insurance Premiums Paid', 'Rental Expenses', 'Investment Expenses', 'Pensions Paid', 'Div 293 Payment', 'Lumpsum'],
	assets: ['Listed Shares', 'Unlisted Shares', 'Managed Investments', 'Term Deposit', 'Real Estate Property', 'Other Assets', 'Bank Account', 'Amounts Receivable', 'Sundry Debtors'],
	liabilities: ['Sundry Creditors', 'Loan', 'Amounts Payable', 'Income Tax Payable', 'GST Payable', 'Other Liabilities', 'Amounts Payable', 'GST Payable', 'Member Account']
};

export const SUBCATEGORIESFILTER: { [key: string]: string[] } = {
	all: ['All'],
	income: ['Capital Gains', 'Distributions', 'Dividends', 'Employer Contributions', 'Interest Received', 'Concessional Contributions', 'Non Concessional COntributions', 'Interest Received', 'Other Income', 'Rental Income', 'Transfer In/Roll Over'],
	expenses: ['Accountancy Fees', 'Asic Fees', 'Audit Fees', 'Insurance Premiums Paid', 'Rental Expenses', 'Investment Expenses', 'Pensions Paid', 'Div 293 Payment', 'Lumpsum'],
	assets: ['Listed Shares', 'Unlisted Shares', 'Managed Investments', 'Term Deposit', 'Real Estate Property', 'Other Assets', 'Bank Account', 'Amounts Receivable', 'Sundry Debtors'],
	liabilities: ['Sundry Creditors', 'Loan', 'Amounts Payable', 'Income Tax Payable', 'GST Payable', 'Other Liabilities', 'Amounts Payable', 'GST Payable', 'Member Account']
};

export const QUERYRESPONSETYPE: SimpleTab[] = [
	{ index: 0, label: 'Confirmation', data: { code: 'confirmation' } },
	{ index: 1, label: 'Clarification', data: { code: 'clarification' } },
	{ index: 2, label: 'Document', data: { code: 'document' } },
];

export interface QueryFilter {
	code: string;
	value: number;
}

export class QueryFilter {
	static defaultQueryFilter(code: string, value: number = 0) {
		return {
			code: code, value: value
		} as QueryFilter;
	}
}

export interface QueryFilters {
	category: QueryFilter;
	sub_category: QueryFilter;
	criticality: QueryFilter;
	query_status: QueryFilter;
	raised_to: QueryFilter;
	raised_by: QueryFilter;
}

export class QueryFilters {
	static defaultQueryFilters() {
		return {
			category: QueryFilter.defaultQueryFilter('category_id', 0),
			sub_category: QueryFilter.defaultQueryFilter('sub_category_id', 0),
			criticality: QueryFilter.defaultQueryFilter('criticality_id', 0),
			query_status: QueryFilter.defaultQueryFilter('status_id', 0),
			raised_to: QueryFilter.defaultQueryFilter('raised_to_id', 0),
			raised_by: QueryFilter.defaultQueryFilter('raised_by_id', 0),
		} as QueryFilters;
	}
}

export type DownloadableJobsFieldOption = {
	key: keyof JobQueries;
	label: string;
	isSelected: boolean;
};

export interface JobQueries {
	fy: number;
	job_id: number;
	job_name: string;
	job_touchpoint: string;
	jy: string;
	open: number;
	query_code: string;
	query_posted_date: string;
	query_title: string;
	resolved: number;
	responded: number;
	client_id: number;
	client: string;
	sub_client: string;
	sub_client_id: number;
	total_queries: number;
	vertical_id: number;
	vertical_name: string;
}

export class JobQueries {
	static defaultJobQuery() {
		return {
			fy: 0,
			job_id: 0,
			job_name: "",
			job_touchpoint: "",
			jy: "",
			open: 0,
			query_code: "",
			query_posted_date: "",
			query_title: "",
			resolved: 0,
			responded: 0,
			client_id: 0,
			client: "",
			sub_client: "",
			sub_client_id: 0,
			total_queries: 0,
			vertical_id: 0,
			vertical_name: "",
		} as JobQueries;
	}

	static downloadableJobsFieldOptions(): DownloadableJobsFieldOption[] {
		return [
			{ key: 'job_id', 			label: 'Job ID', 			isSelected: false },
			{ key: 'job_name', 			label: 'Job Name', 			isSelected: true },
			{ key: 'query_code', 		label: 'Query Code', 		isSelected: false },
			{ key: 'query_title', 		label: 'Query Title', 		isSelected: true },
			{ key: 'query_posted_date', label: 'Posted Date', 		isSelected: false },
			{ key: 'client', 			label: 'Client', 			isSelected: false },
			{ key: 'sub_client', 		label: 'Sub-Client', 		isSelected: false },
			{ key: 'vertical_name', 	label: 'Vertical', 			isSelected: false },
			{ key: 'open', 				label: 'Open Queries', 		isSelected: true },
			{ key: 'resolved', 			label: 'Resolved Queries', 	isSelected: true },
			{ key: 'responded', 		label: 'Responded Queries', isSelected: true },
			{ key: 'total_queries', 	label: 'Total Queries', 	isSelected: true }
		];
	}
}

export interface QueryTemplate {
	id: number;
	query_template_code: string;
	title: string;
	query: string;
	category_id: number;
	category_code: string;
	category_name: string;
	sub_category_id: number;
	sub_category_code: string;
	sub_category_name: string;
	criticality_id: number;
	criticality_code: string;
	criticality_name: string;
	job_stage_id: number;
	job_stage_code: string;
	job_stage_name: string;
	response_type: string;
	response_type_id: number;
}

export class QueryTemplate {
	static defaultQueryTemplate(
		id = -1, query_template_code = '', title = "Request for clarification", query = "", category_id = -1, sub_category_id = -1, criticality_id = -1, response_type = "confirmation", response_type_id = -1
	) {
		return {
			id: id,
			query_template_code: query_template_code,
			title: title,
			query: query,
			category_id: category_id,
			sub_category_id: sub_category_id,
			criticality_id: criticality_id,
			response_type: response_type,
			response_type_id: response_type_id
		} as QueryTemplate;
	}
}

export type DownloadableQueriesFieldOption = {
	key: keyof Query;
	label: string;
	isSelected: boolean;
};

export interface Query {
	id?: number;
	queryIndex?: number;
	query_code: string;
	title: string;
	query: string;
	category_id: number;
	category_name: string;
	sub_category_id: number;
	sub_category_name: string;
	criticality_id: number;
	criticality_name: string;
	query_status_id: number;
	query_status_name: string;
	job_id: number;
	job_touchpoint: string;
	raised_by_id: number;
	raised_by_name: string;
	raised_by_type: undefined | "client" | "internal";
	raised_to_id: number;
	raised_to_name: string;
	elapsed_days: number;
	posted_date: string;
	resolved_date: string;
	parent_query_id: number;
	response_type: string;
	response_type_id: number;
	response_type_description: string;
	response_value: string;
	show_attachment_input: boolean;
	attachments: QueryAttachment[],
	filters: {
		category_name: string;
		sub_category_name: string;
		criticality_name: string;
	}
}

export interface QueryAttachment {
	link: string;
	user_id: number;
	title: string;
}

export class QueryAttachment {
	static defaultQueryAttachment() {
		return {
			link: "",
			user_id: 0,
			title: "",
		} as QueryAttachment;
	}
}

export class Query {

	static defaultQuery(queryIndex: number = 0): Query {
		const formattedCurrentDate = (date: Date) => {
			const pad = (n: number) => String(n).padStart(2, '0');
			return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
		};

		return {
			id: 0,
			queryIndex: 0,
			query_code: "",
			title: "",
			query: "",
			category_id: 0,
			category_name: "",
			sub_category_id: 0,
			sub_category_name: "",
			criticality_id: 0,
			criticality_name: "",
			query_status_id: 0,
			query_status_name: "",
			raised_by_id: 0,
			raised_by_name: "",
			raised_by_type: undefined,
			raised_to_id: 0,
			raised_to_name: "",
			elapsed_days: 0,
			posted_date: formattedCurrentDate(new Date()),
			job_id: -1,
			job_touchpoint: "",
			resolved_date: "",
			parent_query_id: 0,
			response_type: "",
			response_type_id: 0,
			response_type_description: "",
			response_value: "",
			show_attachment_input: false,
			attachments: [],
			filters: {
				category_name: '',
				sub_category_name: '',
				criticality_name: '',
			}
		} as Query;
	}

	static downloadableQueriesFieldOptions(): DownloadableQueriesFieldOption[] {
		return [
			{ key: 'title', 					label: 'Title', 					isSelected: true },
			{ key: 'query', 					label: 'Query', 					isSelected: true },
			{ key: 'category_name', 			label: 'Category Name', 			isSelected: true },
			{ key: 'sub_category_name', 		label: 'Sub-Category Name', 		isSelected: true },
			{ key: 'criticality_name', 			label: 'Criticality Name', 			isSelected: true },
			{ key: 'query_status_name', 		label: 'Query Status Name', 		isSelected: true },
			{ key: 'raised_by_name', 			label: 'Raised By Name', 			isSelected: false },
			{ key: 'raised_to_name', 			label: 'Raised To Name', 			isSelected: false },
			{ key: 'elapsed_days', 				label: 'Elapsed Days', 				isSelected: false },
			{ key: 'response_type_description', label: 'Response Type Description', isSelected: false },
			{ key: 'response_value', 			label: 'Response Value', 			isSelected: true },
		];
	}
}

export interface NewQuery {
	job_id: number,
	title: string,
	query: string,
	criticality_id: number,
	category_id: number,
	sub_category_id: number,
	raised_to_id: number,
	job_touchpoint_id: number,
	job_touchpoint: string,
	client_id: number,
	posted_date: string,
	raised_by_id: number,
	parent_query_id: number,
	response_type: string,
	response_type_id: number,
	response_type_description: string,
	attachments: QueryAttachment[]
}

export class NewQuery {
	static defaultNewQuery() {
		return {
			job_id: 0,
			title: "",
			query: "",
			criticality_id: 0,
			category_id: 0,
			sub_category_id: 0,
			raised_to_id: 0,
			job_touchpoint_id: 0,
			job_touchpoint: "",
			client_id: 0,
			posted_date: "",
			raised_by_id: 0,
			parent_query_id: 0,
			response_type: "clarification",
			response_type_id: 0,
			response_type_description: "",
			"attachments": []
		} as NewQuery;
	}
}

export interface QueryReply {
	query_code: string;
	query: string;
	raised_by_id: number;
	raised_by_name: string;
	raised_by_type: undefined | "client" | "internal";
	parent_query_id: number;
	response_type: string;
	response_type_description: string;
	response_value: string;
	attachments: QueryAttachment[],
	show_attachment_input?: boolean;
	posted_date: string;
}

export class QueryReply {
	static defaultQueryReply() {
		return {
			query_code: "",
			query: "",
			raised_by_id: -1,
			raised_by_name: "",
			raised_by_type: undefined,
			parent_query_id: -1,
			response_type: "",
			response_type_description: "",
			response_value: "",
			attachments: [],
			show_attachment_input: false,
			posted_date: ""
		} as QueryReply;
	}
}