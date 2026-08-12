export interface Master {
  id: number;
  master_code: string;
  master_name: string;
  master_meta_data?: string;
  parent_master_id?: number | null;
}

export interface QueryMaster {
  criticality: Master[];
  category: Master[];
  sub_category: Master[];
  response_type: Master[];
}

export const defaultQueryMaster: QueryMaster = {
  criticality: [],
  category: [],
  sub_category: [],
  response_type: [],
};

export interface MasterItem {
  id: number;
  master_code: string;
  master_name: string;
  master_group: string;
  parent_master_id?: number | null;
  sub_category?: MasterItem[];
}

export interface MasterData {
  categories: MasterItem[];
  criticalities: MasterItem[];
  response_types: MasterItem[];
}
