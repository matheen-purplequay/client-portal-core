namespace WMAPI.Contracts.Request;

public class QueryUpdateRequest
{
    public int query_id { get; set; }
    public int status { get; set; }
    public string query { get; set; }
    public string title { get; set; }
    public int user_id { get; set; }
    public string user_name { get; set; }
    public string reject_reason { get; set; }
    public string edited_reason { get; set; }
}