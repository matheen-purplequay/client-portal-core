using Microsoft.AspNetCore.Mvc;
using MySqlX.XDevAPI;
using System.Text.Json.Nodes;
using QueryAPI.Contracts.Response;
using WMAPI.Contracts.Request;
using WMAPI.Models.CommonModels;
using WMAPI.Models.QueryModels;
using Org.BouncyCastle.Tls;

namespace WMAPI.Repositories.QueryRepository
{
    public interface IQueryRepository
    {
        Task<List<Dictionary<string, object>>> GetJobDetailsAdmin(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId);

        Task<List<Dictionary<string, object>>> GetJobDetails(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId);

        Task<AddEdit> InsertQueryApprovers(int userId, int clientId);

        Task<AddEdit> RemoveQueryApprovers(int clientId);

        Task<List<Dictionary<string, object>>> GetQueryApprovers(int clientId);

        Task<AddEdit> InsertQuery(InsertQueryModel data, string queryCode);

        Task<AddEdit> InsertDocLink(InsertDocLinkModel data);

        Task<AddEdit> InsertQueryDocLink(List<QueryDocLinkModel> data);

        Task<Dictionary<string, List<Dictionary<string, object>>>> GetAllMasters(List<string> types);

        Task<List<Dictionary<string, object>>> GetQueries(FilterRequestModel filters, Boolean includeAttachments);

        Task<List<Dictionary<string, object>>> GetSubQueries(FilterSubQueriesModel requestModel, Boolean isAdmin);

        Task<AddEdit> QueryStatusUpdate(int queryId, int status, int user_id, string user_name, string reject_reason, string title = "", string query = "", string edited_reason = "");

        Task<QueryCountsResult> GetQueryCounts(int projectId);

        Task<AddEdit> SyncUserData(UserData data);

        Task<List<UserData>> GetUsersFromExternalApi(int projectId);

        Task<AddEdit> InsertSubQueryDocLink(SubQueryDocLinkModel data, Boolean isClient);

        Task<AddEdit> InsertSubQuery(InsertSubQueryModel data, string queryCode, Boolean isClient);

        Task<List<Dictionary<string, object>>> GetQueryTemplates();

        Task<List<Dictionary<string, object>>> GetQueryTemplate(int id);

        Task<AddEdit> SaveQueryTemplate(QueryTemplate queryTemplate);

        Task<AddEdit> UpdateQueryTemplate(QueryTemplate queryTemplate);

        Task<List<Dictionary<string, object>>> GetDraftQueries(int userId, int clientId);

        Task<AddEdit> ResolveQuery(int query_id);

        Task<List<Dictionary<string, object>>> GetJobDetailsApprover(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId);

        Task<bool> IsApproverThereAsync(int parentQueryId, int raisedById);

        Task<List<Dictionary<string, object>>> GetDraftSubQueries(int userId, int clientId);
    }
}
