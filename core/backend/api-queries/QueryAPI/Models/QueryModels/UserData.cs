using System.Text.Json.Serialization;

namespace WMAPI.Models.QueryModels;

public class UserData
{
    [JsonPropertyName("first_name")]
    public string FirstName { get; set; }

    [JsonPropertyName("middle_name")]
    public string MiddleName { get; set; }

    [JsonPropertyName("last_name")]
    public string LastName { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; }

    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("wm_client_id")]
    public int? WmClientId { get; set; }

    [JsonPropertyName("wm_user_id")]
    public int? WmUserId { get; set; }
}