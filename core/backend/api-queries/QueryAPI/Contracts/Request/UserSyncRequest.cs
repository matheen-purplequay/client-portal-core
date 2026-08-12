namespace WMAPI.Contracts.Request;

public class UserSyncRequest
{
    public int id { get; set; }
    public string first_name { get; set; }
    public string middle_name { get; set; }
    public string last_name { get; set; }
    public string email { get; set; }
    public int wm_client_id { get; set; }
    public int wm_user_id { get; set; }
}