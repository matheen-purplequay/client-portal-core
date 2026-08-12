using WMAPI.Contracts.Request;

namespace WMAPI.Models.QueryModels
{
    public class QueryDocLinkModel
    {
        public int job_id { get; set; }
        public string title { get; set; }
        public string query { get; set; }
        public int criticality_id { get; set; }
        public int category_id { get; set; }
        public int sub_category_id { get; set; }
        public int raised_to_id { get; set; }
        public int job_touchpoint_id { get; set; }
        public string job_touchpoint { get; set; }
        public int client_id { get; set; }
        public string posted_date { get; set; }
        public int raised_by_id { get; set; }
        public int parent_query_id { get; set; }
        public string response_type { get; set; }
        public string response_type_description { get; set; }
        
        public string response_value { get; set; }
        public List<RequestDocLinkModel> attachments { get; set; }
        
        // public List<RequestDocLinkModel> response_attachments { get; set; }
    }
}
