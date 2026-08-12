using WMAPI.Models.QueryModels;

namespace QueryAPI.Contracts.Response;

public class UserDataResponse<T>
{
    public bool Status { get; set; }
    public T Data { get; set; }
}