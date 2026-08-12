namespace WMAPI.Models.QueryModels;

public class QueryTemplate
{
    public int id { get; set; }
    public string query_template_code { get; set; }
    public string title { get; set; }
    public int job_stage_id { get; set; }
    public int category_id { get; set; }
    public int sub_category_id { get; set; }
    public int criticality_id { get; set; }
    public string query { get; set; }
    public string response_type { get; set; }
}