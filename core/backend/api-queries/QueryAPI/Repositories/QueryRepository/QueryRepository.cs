using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using MySqlX.XDevAPI;
using System;
using System.Data;
using System.Text;
using System.Text.Json;
using QueryAPI.Contracts.Response;
using WMAPI.Contracts.Request;
using WMAPI.Models.CommonModels;
using WMAPI.Models.QueryModels;
using WMAPI.QueryAPI.Utils;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using Mysqlx.Crud;

namespace WMAPI.Repositories.QueryRepository
{
    public class QueryRepository : IQueryRepository
    {
        private readonly string _connectionString;

        public QueryRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<List<Dictionary<string, object>>> GetJobDetailsAdmin(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId )
        {
            try
            {
                var queries = new List<Dictionary<string, object>>();

                bool isFilters = queryStatusId > 0 || queryCriticalityId > 0 || querycategoryId > 0 || querySubCategoryId > 0;

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_JobDetails_Admin(@__userId,@__clientId,@__queryStatusId,@__queryCriticalityId,@__queryCategoryId,@__querySubCategoryId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add parameters if required
                        command.Parameters.AddWithValue("@__userId", userId);
                        command.Parameters.AddWithValue("@__clientId", clientId);
                        command.Parameters.AddWithValue("@__queryStatusId", queryStatusId);
                        command.Parameters.AddWithValue("@__queryCriticalityId", queryCriticalityId);
                        command.Parameters.AddWithValue("@__queryCategoryId", querycategoryId); 
                        command.Parameters.AddWithValue("@__querySubCategoryId", querySubCategoryId);
                        command.Parameters.AddWithValue("@__isFilters", isFilters);

                        using (var reader = await command.ExecuteReaderAsync()) // ExecuteReaderAsync for async reading
                        {
                            while (await reader.ReadAsync())
                            {
                                try
                                {
                                    var row = new Dictionary<string, object>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        var columnName = reader.GetName(i);
                                        object value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                                        row[columnName] = value;
                                    }
                                    queries.Add(row);
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Row read failed: {ex.Message}");
                                }
                            }

                        }
                    }
                }

                return queries;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching job details.", ex);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetJobDetails(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId)
        {
            try
            {
                var jobdata = new List<Dictionary<string, object>>();

                bool isFilters = queryStatusId > 0 || queryCriticalityId > 0 || querycategoryId > 0 || querySubCategoryId > 0;

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_JobDetails(@__userId,@__clientId,@__queryStatusId,@__queryCriticalityId,@__queryCategoryId,@__querySubCategoryId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add parameters if required
                        command.Parameters.AddWithValue("@__userId", userId);
                        command.Parameters.AddWithValue("@__clientId", clientId);
                        command.Parameters.AddWithValue("@__queryStatusId", queryStatusId);
                        command.Parameters.AddWithValue("@__queryCriticalityId", queryCriticalityId);
                        command.Parameters.AddWithValue("@__queryCategoryId", querycategoryId);
                        command.Parameters.AddWithValue("@__querySubCategoryId", querySubCategoryId);
                        //command.Parameters.AddWithValue("@__isFilters", isFilters);

                        using (var reader = await command.ExecuteReaderAsync()) // ExecuteReaderAsync for async reading
                        {
                            while (await reader.ReadAsync()) // Read asynchronously
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader[i]);
                                }

                                jobdata.Add(row);
                            }
                        }
                    }
                }

                return jobdata;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching job details.", ex);
            }
        }

        public async Task<AddEdit> InsertQueryApprovers(int userId, int clientId)
        {
            try
            {
                var data = new AddEdit();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_InsertQueryApprovers(@__userId, @__clientId, @__LastId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__userId", userId);
                        command.Parameters.AddWithValue("@__clientId", clientId);

                        // Add output parameter
                        var lastIdParam = new MySqlParameter("@__LastId", MySqlDbType.Int32)
                        {
                            Direction = System.Data.ParameterDirection.Output
                        };
                        command.Parameters.Add(lastIdParam);

                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Retrieve the OUT parameter value
                        var lastInsertedId = Convert.ToInt32(lastIdParam.Value);

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Insert successful";
                        data.Id = lastInsertedId.ToString();
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while inserting the data", ex);
            }
        }

        public async Task<AddEdit> RemoveQueryApprovers(int clientId)
        {
            try
            {
                var data = new AddEdit();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_RemoveQueryApprovers(@__clientId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__clientId", clientId);

                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "removed successfully";
                    }
                }


                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while inserting the data", ex);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetQueryApprovers(int clientId)
        {
            try
            {
                var data = new List<Dictionary<string, object>>();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_GetQueryApprovers(@__clientId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add parameters if required
                        command.Parameters.AddWithValue("@__clientId", clientId);

                        using (var reader = await command.ExecuteReaderAsync()) // ExecuteReaderAsync for async reading
                        {
                            while (await reader.ReadAsync()) // Read asynchronously
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader[i]);
                                }

                                data.Add(row);
                            }
                        }
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching data.", ex);
            }
        }

        private async Task<string> GenerateUniqueQueryId()
        {
            Random random = new Random();
            string Nquery_code;


            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                do
                {
                    // Generate a random 5-digit number with prefix "QRY"
                    Nquery_code = "Q" + random.Next(10000, 99999);

                    // Check if the ID already exists in the database
                    string query = "SELECT COUNT(*) FROM tbl_queries WHERE query_code = @query_code";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Use a parameterized query to prevent SQL injection
                        command.Parameters.AddWithValue("@query_code", Nquery_code);

                        var count = (long)await command.ExecuteScalarAsync();

                        if (count == 0)
                        {
                            // If no matching record exists, the ID is unique
                            break;
                        }
                    }
                } while (true);
            }

            return Nquery_code;
        }

        public async Task<AddEdit> InsertQuery(InsertQueryModel request, string queryCode)
        {
            try
            {
                var data = new AddEdit();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query =
                        "CALL SP_SMSF_Portal_InsertQuery( @__queryCode, @__jobId, @__title, @__query, @__criticalityId, @__categoryId, @__subCategoryId, @__raisedToId, @__raisedToName, @__clientId, @__jobTouchPointId, @__jobTouchPoint, @__postedDate, @__raisedById, @__raisedByName, @__parentQueryId, @__responseType, @__responseTypeDescription, @__responseValue, @__LastId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__queryCode", queryCode);
                        command.Parameters.AddWithValue("@__jobId", request.job_id);
                        command.Parameters.AddWithValue("@__title", request.title);
                        command.Parameters.AddWithValue("@__query", request.query);
                        command.Parameters.AddWithValue("@__criticalityId", request.criticality_id);
                        command.Parameters.AddWithValue("@__categoryId", request.category_id);
                        command.Parameters.AddWithValue("@__subCategoryId", request.sub_category_id);
                        command.Parameters.AddWithValue("@__raisedToId", request.raised_to_id);
                        command.Parameters.AddWithValue("@__raisedToName", request.raised_to_name);
                        command.Parameters.AddWithValue("@__clientId", request.client_id);
                        command.Parameters.AddWithValue("@__jobTouchPointId", request.job_touchpoint_id);
                        command.Parameters.AddWithValue("@__jobTouchPoint", request.job_touchpoint);
                        command.Parameters.AddWithValue("@__postedDate", request.posted_date);
                        command.Parameters.AddWithValue("@__raisedById", request.raised_by_id);
                        command.Parameters.AddWithValue("@__raisedByName",
                            (request.raised_by_name != "") ? request.raised_by_name : "");
                        command.Parameters.AddWithValue("@__parentQueryId", request.parent_query_id);
                        command.Parameters.AddWithValue("@__responseType", request.response_type);
                        command.Parameters.AddWithValue("@__responseTypeDescription",
                            request.response_type_description);
                        command.Parameters.AddWithValue("@__responseValue", request.response_value);

                        // Add output parameter
                        var lastIdParam = new MySqlParameter("@__LastId", MySqlDbType.Int32)
                        {
                            Direction = System.Data.ParameterDirection.Output
                        };
                        command.Parameters.Add(lastIdParam);

                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Retrieve the OUT parameter value
                        var lastInsertedId = Convert.ToInt32(lastIdParam.Value);

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Insert successful";
                        data.Id = lastInsertedId.ToString();
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching job details.", ex);
            }
        }

        public async Task<AddEdit> InsertDocLink(InsertDocLinkModel request)
        {
            try
            {
                var data = new AddEdit();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query =
                        "CALL SP_SMSF_Portal_InsertDocLink(@__title , @__link, @__queryid, @__userid, @__LastId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__title", request.title);
                        command.Parameters.AddWithValue("@__link", request.link);
                        command.Parameters.AddWithValue("@__queryid", request.query_id);
                        command.Parameters.AddWithValue("@__userid", request.user_id);

                        // Add output parameter
                        var lastIdParam = new MySqlParameter("@__LastId", MySqlDbType.Int32)
                        {
                            Direction = System.Data.ParameterDirection.Output
                        };
                        command.Parameters.Add(lastIdParam);

                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Retrieve the OUT parameter value
                        var lastInsertedId = Convert.ToInt32(lastIdParam.Value);

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Insert successful";
                        data.Id = lastInsertedId.ToString();
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching job details.", ex);
            }
        }

        public async Task<AddEdit> InsertQueryDocLink(List<QueryDocLinkModel> request)
        {
            foreach (var query in request)
            {
                List<InsertQueryModel> combinedRequest = new List<InsertQueryModel>();

                var queryData = new InsertQueryModel
                {
                    job_id = query.job_id,
                    title = query.title,
                    query = query.query,
                    criticality_id = query.criticality_id,
                    category_id = query.category_id,
                    sub_category_id = query.sub_category_id,
                    raised_to_id = query.raised_to_id,
                    job_touchpoint_id = query.job_touchpoint_id,
                    job_touchpoint = query.job_touchpoint,
                    client_id = query.client_id,
                    posted_date = query.posted_date,
                    raised_by_id = query.raised_by_id,
                    parent_query_id = query.parent_query_id,
                    response_type = query.response_type,
                    response_type_description = query.response_type_description,
                    response_value = query.response_value
                };

                var queryCode = await GenerateUniqueQueryId();

                // Insert query and get the Query ID
                var queryResult = await InsertQuery(queryData, queryCode);

                if (queryResult.statusCode != 200)
                    throw new Exception($"Error while inserting query: {queryData.title}");

                int queryId = int.Parse(queryResult.Id);

                // Insert associated document links
                foreach (var attachment in query.attachments)
                {
                    var docLinkModel = new InsertDocLinkModel
                    {
                        title = attachment.title,
                        link = attachment.link,
                        user_id = attachment.user_id,
                        query_id = queryId
                    };

                    var docLinkResult = await InsertDocLink(docLinkModel);

                    if (docLinkResult.statusCode != 200)
                        throw new Exception($"Error while inserting document link: {attachment.link}");
                }

                // if (query.response_type == "document")
                // {
                //     var result = await InsertResponseQuery(query);
                //     
                //     if (result.statusCode != 200)
                //         throw new Exception($"Error while inserting response documents link");
                //     
                //     // Insert associated document links
                //     foreach (var attachment in query.response_attachments)
                //     {
                //         var docLinkModel = new InsertDocLinkModel
                //         {
                //             title = attachment.title,
                //             link = attachment.link,
                //             user_id = attachment.user_id,
                //             query_id = queryId
                //         };
                //
                //         var docLinkResult = await InsertDocLink(docLinkModel);
                //
                //         if (docLinkResult.statusCode != 200)
                //             throw new Exception($"Error while inserting document link: {attachment.link}");
                //     }
                // }
            }

            return new AddEdit
            {
                statusCode = 200,
                message = "All queries and document links inserted successfully"
            };
        }

        public async Task<AddEdit> InsertResponseQuery(QueryDocLinkModel query)
        {
            var queryData = new InsertQueryModel
            {
                job_id = query.job_id,
                title = query.title,
                query = query.query,
                criticality_id = query.criticality_id,
                category_id = query.category_id,
                sub_category_id = query.sub_category_id,
                raised_to_id = query.raised_to_id,
                job_touchpoint_id = query.job_touchpoint_id,
                job_touchpoint = query.job_touchpoint,
                client_id = query.client_id,
                posted_date = query.posted_date,
                raised_by_id = query.raised_by_id,
                parent_query_id = query.parent_query_id,
                response_type = query.response_type,
                response_type_description = query.response_type_description,
                response_value = query.response_value
            };

            var queryCode = await GenerateUniqueQueryId();

            // Insert query and get the Query ID
            var queryResult = await InsertQuery(queryData, queryCode);

            if (queryResult.statusCode != 200)
                throw new Exception($"Error while inserting query: {queryData.title}");

            return queryResult;
        }

        public async Task<Dictionary<string, List<Dictionary<string, object>>>> GetAllMasters(List<string> types)
        {
            try
            {
                var result = new Dictionary<string, List<Dictionary<string, object>>>();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    foreach (var type in types)
                    {
                        var query = "CALL SP_SMSF_Portal_GetMasterData(@__type);";

                        using (var command = new MySqlCommand(query, connection))
                        {
                            // Add parameters for the stored procedure
                            command.Parameters.Clear();
                            command.Parameters.AddWithValue("@__type", type);

                            var data = new List<Dictionary<string, object>>();

                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var row = new Dictionary<string, object>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        row.Add(reader.GetName(i), reader[i]);
                                    }

                                    data.Add(row);
                                }
                            }

                            // Add the data to the result dictionary
                            result[type] = data;
                        }
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching master data.", ex);
            }
        }

        public async Task<Dictionary<string, List<Dictionary<string, object>>>> GetMastersById(int id)
        {
            try
            {
                var result = new Dictionary<string, List<Dictionary<string, object>>>();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_GetMasterDataById(@__id);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add parameters for the stored procedure
                        command.Parameters.Clear();
                        command.Parameters.AddWithValue("@__id", id);

                        var data = new List<Dictionary<string, object>>();

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader[i]);
                                }

                                data.Add(row);
                            }
                        }

                        // Add the data to the result dictionary
                        result["data"] = data;
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching master data.", ex);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetQueries(FilterRequestModel requestModel, Boolean includeAttachments = true)
        {
            try
            {
                var jobData = new List<Dictionary<string, object>>();
                // Rows needing attachments are tracked separately and resolved with
                // one batched query after the main result set is read, instead of
                // one extra DB round trip (new connection + stored procedure call)
                // per row — that N+1 pattern was the main cause of RetrieveQueries
                // being slow for jobs with more than a handful of queries.
                var rowsNeedingAttachments = new List<(Dictionary<string, object> row, int queryId)>();

                if (string.IsNullOrWhiteSpace(requestModel.filters[0].code))
                {
                    using (var connection = new MySqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();

                        var query = "CALL SP_SMSF_Portal_GetQueries();";

                        using (var command = new MySqlCommand(query, connection))
                        {
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var row = new Dictionary<string, object>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        row.Add(reader.GetName(i), reader[i]);
                                    }

                                    if (row.ContainsKey("id") && int.TryParse(row["id"].ToString(), out var queryId))
                                    {
                                        rowsNeedingAttachments.Add((row, queryId));
                                    }

                                    jobData.Add(row);
                                }
                            }
                        }
                    }
                }
                else
                {
                    var whereCondition = new StringBuilder();

                    var validConditions = requestModel.filters
                        .Where(filter => filter.value > 0)
                        .Select(filter => $"{filter.code} = '{filter.value}'")
                        .ToList();

                    if (validConditions.Any())
                    {
                        whereCondition.Append(string.Join(" AND ", validConditions));
                    }

                    var whereConditionStr = new StringBuilder();
                    if (whereCondition.Length > 0)
                    {
                        whereConditionStr.Append(" WHERE ")
                            .Append(" q1.job_id = ").Append(requestModel.jobId)
                            .Append(" AND ").Append(whereCondition);
                    }
                    else
                    {
                        whereConditionStr.Append(" WHERE ")
                            .Append(" q1.job_id = ").Append(requestModel.jobId);
                    }

                    if (requestModel.isAdmin == false)
                    {
                        whereConditionStr.Append(" and q1.status_id != 1 and ").Append(" q1.status_id != 5 ");
                    }

                    Console.WriteLine(whereCondition);

                    using (var connection = new MySqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();

                        using (var command = new MySqlCommand("SP_SMSF_Portal_GetQueries", connection))
                        {
                            command.CommandType = CommandType.StoredProcedure;

                            // Add parameter safely
                            command.Parameters.AddWithValue("where_condition", whereConditionStr.ToString());

                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var row = new Dictionary<string, object>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        row.Add(reader.GetName(i), reader.IsDBNull(i) ? "" : reader[i]);
                                    }

                                    if (includeAttachments && row.ContainsKey("id") && int.TryParse(row["id"].ToString(), out var queryId))
                                    {
                                        rowsNeedingAttachments.Add((row, queryId));
                                    }

                                    jobData.Add(row);
                                }
                            }
                        }
                    }
                }

                if (rowsNeedingAttachments.Count > 0)
                {
                    var attachmentsByQueryId = await GetAttachmentsForQueries(rowsNeedingAttachments.Select(r => r.queryId).Distinct().ToList());
                    foreach (var (row, queryId) in rowsNeedingAttachments)
                    {
                        row["attachments"] = attachmentsByQueryId.TryGetValue(queryId, out var attachments)
                            ? attachments
                            : new List<Dictionary<string, object>>();
                    }
                }

                return jobData;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching queries details.", ex);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetDraftQueries(int userId, int clientId)
        {
            try
            {
                var jobData = new List<Dictionary<string, object>>();

                if (userId != 0)
                {
                    using (var connection = new MySqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();

                        var query = "CALL SP_SMSF_Portal_GetDraftQueries(@__user_id, @__client_id);";

                        using (var command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@__user_id", userId);
                            command.Parameters.AddWithValue("@__client_id", clientId);

                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var row = new Dictionary<string, object>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        var columnName = reader.GetName(i);
                                        var value = reader.IsDBNull(i) ? null : reader[i];

                                        // Check specific columns for empty JSON objects and set them to null
                                        if (value is string strValue && string.IsNullOrEmpty(strValue))
                                        {
                                            value = null;
                                        }

                                        row.Add(columnName, value);
                                        // row.Add(reader.GetName(i), reader[i]);
                                    }

                                    // Get the query ID and fetch attachments
                                    if (row.ContainsKey("id") && int.TryParse(row["id"].ToString(), out var queryId))
                                    {
                                        var attachments = await GetAttachmentsForQuery(queryId);
                                        row["attachments"] = attachments;
                                    }

                                    jobData.Add(row);
                                }
                            }
                        }
                    }
                }

                return jobData;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching draft queries details.", ex);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetSubQueries(FilterSubQueriesModel requestModel, Boolean isAdmin)
        {
            try
            {
                var subQueries = new List<Dictionary<string, object>>();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Pass the WHERE condition into the stored procedure
                    using (var command = new MySqlCommand("SP_SMSF_Portal_GetSubQueries", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        // Add parameter safely
                        command.Parameters.AddWithValue("__query_id", requestModel.queryId);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader.IsDBNull(i) ? "" : reader[i]);
                                }

                                // Get the query ID and fetch attachments
                                if (row.ContainsKey("id") && int.TryParse(row["id"].ToString(), out var queryId))
                                {
                                    var attachments = await GetAttachmentsForQuery(queryId);
                                    row["attachments"] = attachments;
                                }

                                subQueries.Add(row);
                            }
                        }
                    }
                }

                return subQueries;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching job details.", ex);
            }
        }

        private async Task<List<Dictionary<string, object>>> GetAttachmentsForQuery(int queryId)
        {
            try
            {
                var data = new List<Dictionary<string, object>>();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_GetAttachmentsForQuery(@__query_id);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add parameters if required
                        command.Parameters.AddWithValue("@__query_id", queryId);

                        using (var reader = await command.ExecuteReaderAsync()) // ExecuteReaderAsync for async reading
                        {
                            while (await reader.ReadAsync()) // Read asynchronously
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader[i]);
                                }

                                data.Add(row);
                            }
                        }
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching data.", ex);
            }
        }

        // Batched equivalent of GetAttachmentsForQuery: one query for every
        // query_id in the list instead of one connection + stored-procedure
        // call per query. Same columns as SP_SMSF_Portal_GetAttachmentsForQuery
        // (link_id, title, link, user_id), plus query_id to group by.
        private async Task<Dictionary<int, List<Dictionary<string, object>>>> GetAttachmentsForQueries(List<int> queryIds)
        {
            var result = new Dictionary<int, List<Dictionary<string, object>>>();

            try
            {
                if (queryIds == null || queryIds.Count == 0) return result;

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var idList = string.Join(",", queryIds.Distinct());
                    var query = $"SELECT id AS link_id, title, link, user_id, query_id FROM tbl_doc_link WHERE query_id IN ({idList});";

                    using (var command = new MySqlCommand(query, connection))
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var row = new Dictionary<string, object>();
                            for (int i = 0; i < reader.FieldCount; i++)
                            {
                                row.Add(reader.GetName(i), reader[i]);
                            }

                            var queryId = Convert.ToInt32(row["query_id"]);
                            row.Remove("query_id");

                            if (!result.ContainsKey(queryId)) result[queryId] = new List<Dictionary<string, object>>();
                            result[queryId].Add(row);
                        }
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching attachments.", ex);
            }
        }

        public async Task<AddEdit> QueryStatusUpdate(int query_id, int status, int user_id, string user_name, string reject_reason , string edited_reason, string query, string title )
        {
            try
            {
                Console.WriteLine($"Recieved parameters query id: {query_id}, status: {status}, user id: {user_id}, user name: {user_name}, reject reason: {reject_reason}, edited reason: {edited_reason} , query: {query}, title: {title}");
                var data = new AddEdit();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var sql = "CALL SP_SMSF_Portal_QueryStatusUpdate(@__query_id, @__status, @__user_id, @__user_name, @__reject_reason, @__edited_reason, @__query, @__title);";

                    using (var command = new MySqlCommand(sql, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__query_id", query_id);
                        command.Parameters.AddWithValue("@__status", status);
                        command.Parameters.AddWithValue("@__user_id", user_id);
                        command.Parameters.AddWithValue("@__user_name", user_name);
                        command.Parameters.AddWithValue("@__reject_reason", reject_reason);
                        command.Parameters.AddWithValue("@__edited_reason", edited_reason);
                        command.Parameters.AddWithValue("@__query", query);
                        command.Parameters.AddWithValue("@__title", title);


                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Updated successfully";
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while updating the data", ex);
            }
        }

        public async Task<AddEdit> ResolveQuery(int query_id)
        {
            try
            {
                var data = new AddEdit();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var sql = "CALL SP_SMSF_Portal_ResolveQuery(@__query_id);";

                    using (var command = new MySqlCommand(sql, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__query_id", query_id);

                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Updated successfully";
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while updating the data", ex);
            }
        }

        public async Task<QueryCountsResult> GetQueryCounts(int projectId)
        {
            var queryCounts = new QueryCountsResult
            {
                StatusCounts = new List<QueryCount>(),
                AgingCounts = new List<QueryCount>(),
                CriticalityCounts = new List<QueryCount>()
            };

            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = "CALL SP_SMSF_Portal_GetQueryCounts(@__project_id);";

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@__project_id", projectId);

            using var reader = await command.ExecuteReaderAsync();

            // First result set: Status Counts
            while (await reader.ReadAsync())
            {
                queryCounts.StatusCounts.Add(new QueryCount
                {
                    Label = reader["label"]?.ToString(),
                    Count = Convert.ToInt32(reader["count"]),
                    Code = reader["code"]?.ToString(),
                    Meta_Data = reader["master_meta_data"]?.ToString()
                });
            }

            // Second result set: Aging Counts
            if (await reader.NextResultAsync())
            {
                while (await reader.ReadAsync())
                {
                    queryCounts.AgingCounts.Add(new QueryCount
                    {
                        Label = reader["label"]?.ToString(),
                        Count = Convert.ToInt32(reader["count"]),
                        Code = reader["code"]?.ToString()
                    });
                }
            }

            // Third result set: Criticality Counts
            if (await reader.NextResultAsync())
            {
                while (await reader.ReadAsync())
                {
                    queryCounts.CriticalityCounts.Add(new QueryCount
                    {
                        Label = reader["label"]?.ToString(),
                        Count = Convert.ToInt32(reader["count"]),
                        Code = reader["code"]?.ToString(),
                        Meta_Data = reader["master_meta_data"]?.ToString()
                    });
                }
            }

            return queryCounts;
        }


        public async Task<AddEdit> SyncUserData(UserData request)
        {
            try
            {
                var data = new AddEdit();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query =
                        "CALL SP_SMSF_Portal_SyncUsersData(@__firstName , @__middleName, @__lastName, @__email, @__userId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__firstName", request.FirstName);
                        command.Parameters.AddWithValue("@__middleName", request.MiddleName);
                        command.Parameters.AddWithValue("@__lastName", request.LastName);
                        command.Parameters.AddWithValue("@__email", request.Email);
                        command.Parameters.AddWithValue("@__userId", request.Id);

                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Syncing successful";
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while Syncing user details.", ex);
            }
        }

        public async Task<List<UserData>> GetUsersFromExternalApi(int projectId)
        {
            try
            {
                // API URL
                var apiUrl = "https://pqaccountsapi.welingkaronline.org/api/wm-api/get-cp-users";

                using (var client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromMinutes(5);

                    // Prepare the request body
                    var requestBody = new { project_id = projectId };
                    var jsonBody = JsonSerializer.Serialize(requestBody);

                    // Create HTTP request
                    var request = new HttpRequestMessage
                    {
                        Method = HttpMethod.Post,
                        RequestUri = new Uri(apiUrl),
                        Content = new StringContent(jsonBody, Encoding.UTF8, "application/json")
                    };

                    // Execute the request
                    var response = await client.SendAsync(request);

                    // Ensure successful status
                    response.EnsureSuccessStatusCode();

                    // Parse the response content
                    var responseContent = await response.Content.ReadAsStringAsync();

                    // Deserialize into ApiResponse<List<ApiUser>>
                    var apiResponse = JsonSerializer.Deserialize<UserDataResponse<List<UserData>>>(responseContent,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true // To match snake_case to PascalCase
                        });

                    // Return the 'data' field
                    return apiResponse?.Data ?? new List<UserData>();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching data from the external API.", ex);
            }
        }

        public async Task<AddEdit> InsertSubQueryDocLink(SubQueryDocLinkModel request, Boolean isClient)
        {
            var queryData = new InsertSubQueryModel
            {
                query = request.query,
                posted_date = request.posted_date,
                raised_by_id = request.raised_by_id,
                raised_by_name = request.raised_by_name,
                raised_by_type = request.raised_by_type,
                parent_query_id = request.parent_query_id,
                response_type = request.response_type,
                response_type_description = request.response_type_description,
                response_value = request.response_value
            };

            var queryCode = await GenerateUniqueQueryId();

            // Insert query and get the Query ID
            var queryResult = await InsertSubQuery(queryData, queryCode, isClient);

            if (queryResult.statusCode != 200)
                throw new Exception($"Error while inserting sub query: {queryData.query}");

            int queryId = int.Parse(queryResult.Id);

            // Insert associated document links
            foreach (var attachment in request.attachments)
            {
                var docLinkModel = new InsertDocLinkModel
                {
                    title = attachment.title,
                    link = attachment.link,
                    user_id = attachment.user_id,
                    query_id = queryId
                };

                var docLinkResult = await InsertDocLink(docLinkModel);

                if (docLinkResult.statusCode != 200)
                    throw new Exception($"Error while inserting document link: {attachment.link}");
            }

            return new AddEdit
            {
                statusCode = 200,
                message = "All queries and document links inserted successfully"
            };
        }

        public async Task<AddEdit> InsertSubQuery(InsertSubQueryModel request, string queryCode, Boolean isClient)
        {
            try
            {
                var data = new AddEdit();

                bool isApproverThere = await IsApproverThereAsync(request.parent_query_id, request.raised_by_id);

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query =
                        "CALL SP_SMSF_Portal_InsertSubQuery_v1( @__queryCode, @__query, @__postedDate, @__raisedById, @__raisedByName, @__raisedByType, @__parentQueryId, @__status_id, @__responseType, @__responseTypeDescription, @__responseValue, @__LastId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add input parameters
                        command.Parameters.AddWithValue("@__queryCode", queryCode);
                        command.Parameters.AddWithValue("@__query", request.query);
                        command.Parameters.AddWithValue("@__postedDate", request.posted_date);
                        command.Parameters.AddWithValue("@__raisedById", request.raised_by_id);
                        command.Parameters.AddWithValue("@__raisedByName", request.raised_by_name);
                        command.Parameters.AddWithValue("@__raisedByType", request.raised_by_type);
                        command.Parameters.AddWithValue("@__parentQueryId", request.parent_query_id);
                        command.Parameters.AddWithValue("@__status_id", isClient == true ? 67 : (isApproverThere == true ? 66 : 67));
                        command.Parameters.AddWithValue("@__responseType",
                            request.response_type != "" ? request.response_type : "");
                        command.Parameters.AddWithValue("@__responseTypeDescription",
                            request.response_type_description != "" ? request.response_type_description : "");
                        command.Parameters.AddWithValue("@__responseValue",
                            request.response_value != "" ? request.response_value : "");

                        // Add output parameter
                        var lastIdParam = new MySqlParameter("@__LastId", MySqlDbType.Int32)
                        {
                            Direction = System.Data.ParameterDirection.Output
                        };
                        command.Parameters.Add(lastIdParam);

                        // Execute the stored procedure
                        // await command.ExecuteNonQueryAsync();

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader.IsDBNull(i) ? "" : reader[i]);
                                    Console.WriteLine($"values from db {reader.GetName(i)} {reader[i]}");
                                }
                            }
                        }

                        // Retrieve the OUT parameter value
                        var lastInsertedId = Convert.ToInt32(lastIdParam.Value);

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Insert successful";
                        data.Id = lastInsertedId.ToString();
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while saving sub query.", ex);
            }
        }

        // Query Templates
        public async Task<List<Dictionary<string, object>>> GetQueryTemplates()
        {
            try
            {
                var templates = new List<Dictionary<string, object>>();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Pass the WHERE condition into the stored procedure
                    using (var command = new MySqlCommand("SP_SMSF_Portal_GetQueryTemplates", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader.IsDBNull(i) ? "" : reader[i]);
                                }

                                templates.Add(row);
                            }
                        }
                    }
                }

                return templates;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching query templates.", ex);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetQueryTemplate(int id)
        {
            try
            {
                var template = new List<Dictionary<string, object>>();

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Pass the WHERE condition into the stored procedure
                    var query = "CALL SP_SMSF_Portal_InsertQueryTemplates( @__query_template_id);";

                    using (var command = new MySqlCommand("SP_SMSF_Portal_GetQueryTemplate", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@__query_template_id", id);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    row.Add(reader.GetName(i), reader.IsDBNull(i) ? "" : reader[i]);
                                }

                                template.Add(row);
                            }
                        }
                    }
                }

                return template;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching query template.", ex);
            }
        }

        public async Task<AddEdit> SaveQueryTemplate(QueryTemplate queryTemplate)
        {
            try
            {
                var data = new AddEdit();

                // Call stored procedure to insert the query template
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query =
                        "CALL SP_SMSF_Portal_InsertQueryTemplates( @__query_template_code, @__title, @__job_stage_id, @__category_id, @__sub_category_id, @__criticality_id, @__query, @__response_type, @__NewId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@__query_template_code",
                            CodeGenerator.GetAlphaNumericCodeFromCurrentTimestamp());
                        command.Parameters.AddWithValue("@__title", queryTemplate.title);
                        command.Parameters.AddWithValue("@__query", queryTemplate.query);
                        command.Parameters.AddWithValue("@__job_stage_id", queryTemplate.job_stage_id);
                        command.Parameters.AddWithValue("@__category_id", queryTemplate.category_id);
                        command.Parameters.AddWithValue("@__sub_category_id", queryTemplate.sub_category_id);
                        command.Parameters.AddWithValue("@__criticality_id", queryTemplate.criticality_id);
                        command.Parameters.AddWithValue("@__response_type", queryTemplate.response_type);

                        // Add output parameter
                        var lastIdParam = new MySqlParameter("@__NewId", MySqlDbType.Int32)
                        {
                            Direction = System.Data.ParameterDirection.Output
                        };
                        command.Parameters.Add(lastIdParam);

                        // Execute the stored procedure
                        // await command.ExecuteNonQueryAsync();

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            Console.WriteLine("reader after saving query templates");
                        }

                        // Retrieve the OUT parameter value
                        var lastInsertedId = Convert.ToInt32(lastIdParam.Value);

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Insert successful";
                        data.Id = lastInsertedId.ToString();
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                return new AddEdit
                {
                    statusCode = 500,
                    message = $"Error while saving query template: {ex.Message}"
                };
            }
        }

        public async Task<AddEdit> UpdateQueryTemplate(QueryTemplate queryTemplate)
        {
            try
            {
                var data = new AddEdit();

                // Call stored procedure to insert the query template
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query =
                        "CALL SP_SMSF_Portal_UpdateQueryTemplate( @__query_template_id, @__title, @__job_stage_id, @__category_id, @__sub_category_id, @__criticality_id, @__query, @__response_type);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@__query_template_id", queryTemplate.id);
                        command.Parameters.AddWithValue("@__title", queryTemplate.title);
                        command.Parameters.AddWithValue("@__job_stage_id", queryTemplate.job_stage_id);
                        command.Parameters.AddWithValue("@__category_id", queryTemplate.category_id);
                        command.Parameters.AddWithValue("@__sub_category_id", queryTemplate.sub_category_id);
                        command.Parameters.AddWithValue("@__criticality_id", queryTemplate.criticality_id);
                        command.Parameters.AddWithValue("@__query", queryTemplate.query);
                        command.Parameters.AddWithValue("@__response_type", queryTemplate.response_type);


                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            Console.WriteLine("reader after updating query template");
                        }

                        // Populate the AddEdit object
                        data.statusCode = 200; // Success code
                        data.message = "Update successful";
                        data.Id = "0";
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                return new AddEdit
                {
                    statusCode = 500,
                    message = $"Error while saving query template: {ex.Message}"
                };
            }
        }


        public List<object> GroupSubQueriesByJobId(List<Dictionary<string, object>> flatSubQueries)
        {
            var grouped = flatSubQueries
                .GroupBy(q => q.ContainsKey("job_id") ? q["job_id"] : null)
                .Select(g => new
                {
                    job_id = g.Key,
                    job_name = g.FirstOrDefault()?["job_name"],
                    queries = g.ToList()
                })
                .ToList<object>();

            return grouped;
        }



        public async Task<List<Dictionary<string, object>>> GetJobDetailsApprover(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId)
        {
            try
            {
                var queries = new List<Dictionary<string, object>>();

                bool isFilters = queryStatusId > 0 || queryCriticalityId > 0 || querycategoryId > 0 || querySubCategoryId > 0;

                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_JobDetails_New_Approvers(@__userId,@__clientId,@__queryStatusId,@__queryCriticalityId,@__queryCategoryId,@__querySubCategoryId);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Add parameters if required
                        command.Parameters.AddWithValue("@__userId", userId);
                        command.Parameters.AddWithValue("@__clientId", clientId);
                        command.Parameters.AddWithValue("@__queryStatusId", queryStatusId);
                        command.Parameters.AddWithValue("@__queryCriticalityId", queryCriticalityId);
                        command.Parameters.AddWithValue("@__queryCategoryId", querycategoryId);
                        command.Parameters.AddWithValue("@__querySubCategoryId", querySubCategoryId);
                        command.Parameters.AddWithValue("@__isFilters", isFilters);

                        using (var reader = await command.ExecuteReaderAsync()) // ExecuteReaderAsync for async reading
                        {
                            while (await reader.ReadAsync()) // Read asynchronously
                            {
                                var row = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    var columnName = reader.GetName(i);
                                    var value = reader.IsDBNull(i) ? null : reader[i];

                                    // Check specific columns for empty JSON objects and set them to null
                                    if (value is string strValue && string.IsNullOrEmpty(strValue) &&
                                        (columnName == "query_code" || columnName == "query_title" ||
                                         columnName == "query_posted_date"))
                                    {
                                        value = null;
                                    }

                                    row.Add(columnName, value);
                                }

                                queries.Add(row);
                            }
                        }
                    }
                }

                return queries;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching job details.", ex);
            }
        }


        public async Task<bool> IsApproverThereAsync(int parentQueryId, int raisedById)
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = "CALL SP_SMSF_Portal_IsApprover_There(@__parentQueryId, @__raisedById, @isApprover);";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Input parameter
                        command.Parameters.AddWithValue("@__parentQueryId", parentQueryId);
                        command.Parameters.AddWithValue("@__raisedById", raisedById);


                        // Output parameter
                        var outputParam = new MySqlParameter("@isApprover", MySqlDbType.Bit)
                        {
                            Direction = ParameterDirection.Output
                        };
                        command.Parameters.Add(outputParam);

                        // Execute
                        await command.ExecuteNonQueryAsync();

                        // Retrieve output value
                        return Convert.ToBoolean(outputParam.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error while checking approver.", ex);
            }
        }



        public async Task<List<Dictionary<string, object>>> GetDraftSubQueries(int userId, int clientId)
        {
            try
            {
                var jobData = new List<Dictionary<string, object>>();

                if (userId != 0)
                {
                    using (var connection = new MySqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();

                        var query = "CALL SP_SMSF_Portal_GetDraftSubQueries(@__user_id, @__client_id);";

                        using (var command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@__user_id", userId);
                            command.Parameters.AddWithValue("@__client_id", clientId);

                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var row = new Dictionary<string, object>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        var columnName = reader.GetName(i);
                                        var value = reader.IsDBNull(i) ? null : reader[i];

                                        // Check specific columns for empty JSON objects and set them to null
                                        if (value is string strValue && string.IsNullOrEmpty(strValue))
                                        {
                                            value = null;
                                        }

                                        row.Add(columnName, value);
                                        // row.Add(reader.GetName(i), reader[i]);
                                    }

                                    // Get the query ID and fetch attachments
                                    if (row.ContainsKey("id") && int.TryParse(row["id"].ToString(), out var queryId))
                                    {
                                        var attachments = await GetAttachmentsForQuery(queryId);
                                        row["attachments"] = attachments;
                                    }

                                    jobData.Add(row);
                                }
                            }
                        }
                    }
                }

                return jobData;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching draft sub queries details.", ex);
            }
        }


    }
}