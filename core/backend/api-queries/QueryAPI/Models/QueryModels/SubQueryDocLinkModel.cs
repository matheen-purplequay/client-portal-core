using WMAPI.Contracts.Request;

namespace WMAPI.Models.QueryModels;

public class SubQueryDocLinkModel
{
    public string query { get; set; }
    public string posted_date { get; set; }
    public int raised_by_id { get; set; }
    public string raised_by_name { get; set; }
    public string raised_by_type { get; set; }
    public int parent_query_id { get; set; }
    public string response_type { get; set; }
    public string response_type_description { get; set; }
    public string response_value { get; set; }
    public List<RequestDocLinkModel> attachments { get; set; }
}