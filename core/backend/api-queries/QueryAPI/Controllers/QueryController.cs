using Microsoft.AspNetCore.Mvc;
using MySqlX.XDevAPI;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Text.Json;
using System.Text.RegularExpressions;
using OfficeOpenXml;
using WMAPI.Contracts.Request;
using WMAPI.Models.CommonModels;
using WMAPI.Models.QueryModels;
using WMAPI.Repositories.QueryRepository;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace QueryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QueryController : ControllerBase
    {
        private readonly ILogger<QueryController> _logger; // Declare logger
        private readonly QueryRepository _queryRepository; // Declare repository

        public QueryController(ILogger<QueryController> logger, QueryRepository queryRepository) // Inject logger and repository
        {
            _logger = logger;
            _queryRepository = queryRepository;
        }

        [HttpGet("RetrieveAdminJobDetails")]
        public async Task<IActionResult> GetAdminJobDetailsController(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId)
        {
            try
            {
                var jobdata = await _queryRepository.GetJobDetailsAdmin(userId, clientId, queryStatusId, queryCriticalityId, querycategoryId, querySubCategoryId);

                bool status = jobdata.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if ((jobdata != null) && (jobdata.Count > 0))
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        queries = jobdata,
                        error = error
                    });
                }

                return Ok(new { message = "No Job details found for the provided ID.", status = status, error = error });

            }
            catch (Exception ex)
            {
                // Use logger to log the error
                _logger.LogError(ex, "An error occurred while retrieving Job details.");

                return StatusCode(500, new { message = "An error occurred while retrieving Job details.", error = ex.Message, status = false });

            }
        }


        [HttpGet("RetrieveJobDetails")]
        public async Task<IActionResult> GetJobDetailsController(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId)
        {
            try
            {
                var jobdata = await _queryRepository. GetJobDetails(userId, clientId, queryStatusId, queryCriticalityId, querycategoryId, querySubCategoryId);

                bool status = jobdata.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if ((jobdata != null) && (jobdata.Count > 0))
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        queries = jobdata,
                        error = error
                    });
                }

                return Ok(new { message = "No Job details found for the provided ID.", status = status, error = error });

            }
            catch (Exception ex)
            {
                // Use logger to log the error
                _logger.LogError(ex, "An error occurred while retrieving Job details.");

                return StatusCode(500, new { message = "An error occurred while retrieving Job details.", error = ex.Message, status = false });

            }
        }

        [HttpPost("DownloadJobDetails")]
        public async Task<IActionResult> DownloadJobQueriesAsExcel(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId)
        {
            try
            {
                var data = await _queryRepository.GetJobDetails(userId, clientId, queryStatusId, queryCriticalityId, querycategoryId, querySubCategoryId);
                
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Queries");

                if (data.Count > 0)
                {
                    var firstRow = data[0];
                    int colIndex = 1;
                    foreach (var key in firstRow.Keys)
                    {
                        worksheet.Cells[1, colIndex].Value = key;
                        colIndex++;
                    }

                    for (int i = 0; i < data.Count; i++)
                    {
                        int j = 1;
                        foreach (var val in data[i].Values)
                        {
                            worksheet.Cells[i + 2, j++].Value = val?.ToString();
                        }
                    }
                }

                var excelBytes = package.GetAsByteArray();
                var fileName = $"Jobs_for_Queries_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(excelBytes, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generating Excel: {ex.Message}");
            }
        }

        [HttpPost("InsertQueryApprovers")]
        public async Task<IActionResult> InsertQueryApproversController([FromBody] List<InsertQueryApproverModel> request)
        {
            try
            {
                // Validate request list
                if (request == null || request.Count == 0)
                {
                    return BadRequest(new { message = "Request list is empty", status = false});
                }

                if (request.Any(item => item.user_Id == 0 || item.client_Id == 0))
                {
                    return BadRequest(new { message = "Request contains invalid userId or clientId (value 0)", status = false });
                }

                // Assume the client_Id is the same for all records in the list
                var clientId = request[0].client_Id;

                // Step 1: Remove all existing query approvers for the given client ID
                var removeResult = await _queryRepository.RemoveQueryApprovers(clientId);

                // Create a list to store responses from InsertQueryApprovers()
                List<AddEdit> combinedResponses = new List<AddEdit>();

                // Step 2: Insert new approvers using a loop
                foreach (var item in request)
                {
                    // Call InsertQueryApprovers and store the result
                    var result = await _queryRepository.InsertQueryApprovers(item.user_Id, item.client_Id);

                    if (result != null)
                    {
                        // Add result to the combined response list
                        combinedResponses.Add(result);
                    }
                }

                // Step 3: Check if any data was inserted and construct the response
                bool status = combinedResponses.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data inserted successfully",
                        approvers = combinedResponses,
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No details found for the provided data",
                    status = false,
                    approvers = combinedResponses,
                    error = error
                });
            }
            catch (Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while inserting query approvers.");

                return StatusCode(500, new
                {
                    message = "An error occurred while inserting query approvers.",
                    error = ex.Message,
                    status = false
                });
            }
        }


        [HttpGet("RetrieveQueryApprovers")]
        public async Task<IActionResult> GetQueryApproversController(int clientId)
        {
            try
            {
                var data = await _queryRepository.GetQueryApprovers(clientId);

                bool status = data.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if ((data != null) && (data.Count > 0))
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        data = data,
                        error = error
                    });
                }

                return NotFound(new { message = "No data found for the provided ID.", status = status, error = error });

            }
            catch (Exception ex)
            {
                // Use logger to log the error
                _logger.LogError(ex, "An error occurred while retrieving data.");

                return StatusCode(500, new { message = "An error occurred while retrieving data.", error = ex.Message, status = false });

            }
        }


        [HttpPost("InsertQueryDocLinkData")]
        public async Task<IActionResult> InsertQueryDocLinkController([FromBody] List<QueryDocLinkModel> request)
        {
            try
            {

                // Validate request list
                if (request == null || request.Count == 0)
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "C:\\Queryportal\\Jsonfiles");


                // Ensure the directory exists
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // Generate a unique file name based on the current date and time
                string fileName = $"InsertQueryDocLinkData_{DateTime.Now:yyyyMMdd_HHmmss}.json";

                // Define the local file path
                string filePath = Path.Combine(uploadsFolder, fileName);


                // Serialize the request to JSON and save it to the file
                string jsonData = JsonSerializer.Serialize(request, new JsonSerializerOptions { WriteIndented = true });
                await System.IO.File.WriteAllTextAsync(filePath, jsonData); 

                // Create a list to store responses from 
                List<AddEdit> combinedResponses = new List<AddEdit>();

                var result = await _queryRepository.InsertQueryDocLink(request);


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data inserted successfully",
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No details found for the provided data",
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while inserting query approvers.");

                return StatusCode(500, new
                {
                    message = "An error occurred while inserting query approvers.",
                    error = ex.Message,
                    status = false
                });
            }
        }


        [HttpPost("RetrieveAllMasters")]
        public async Task<IActionResult> GetAllMastersController([FromBody] List<string> types)
        {
            try
            {
                // Validate the request
                if (types == null || types.Count == 0)
                {
                    return BadRequest(new { message = "The list of types cannot be null or empty.", status = false });
                }

                // Call the repository
                var data = await _queryRepository.GetAllMasters(types);

                bool status = data.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        masters = data,
                        error = error
                    });
                }

                return NotFound(new { message = "No master details found for the provided types.", status = status, error = error });
            }
            catch (Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while retrieving master data.");

                return StatusCode(500, new { message = "An error occurred while retrieving master data.", error = ex.Message, status = false });
            }
        }

        [HttpGet("RetrieveMastersById")]
        public async Task<IActionResult> GetMastersByIdController(int id)
        {
            try
            {
                // Validate the request
                if (id == 0)
                {
                    return BadRequest(new { message = "The list of types cannot be null or empty.", status = false });
                }

                // Call the repository
                var data = await _queryRepository.GetMastersById(id);

                bool status = data.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        masters = data,
                        error = error
                    });
                }

                return NotFound(new { message = "No master details found for the provided types.", status = status, error = error });
            }
            catch (Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while retrieving master data.");

                return StatusCode(500, new { message = "An error occurred while retrieving master data.", error = ex.Message, status = false });
            }
        }

        [HttpPost("RetrieveQueries")]
        public async Task<IActionResult> GetQueries([FromBody] FilterRequestModel filters)
        {
            try
            {
                // Validate the request
                if (filters.filters.Count == 0)
                {
                    return BadRequest(new { message = "The list of filters cannot be null or empty.", status = false });
                }

                // var userData = await _queryRepository.GetUsersFromExternalApi(filters.projectId);

                // foreach (var Udata in userData)
                // {
                //     var sync = await _queryRepository.SyncUserData(Udata);
                // }

                // Call the repository
                var data = await _queryRepository.GetQueries(filters);

                bool status = data.Count > 0;

                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched successfully",
                        queries = data,
                        error = error
                    });
                }

                return Ok(new { message = "No Queries found for the provided filters.", status = status, error = error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving Queries data.");
                return StatusCode(500, new { message = "An error occurred while retrieving Queries data.", error = ex.Message, status = false });
            }
        }

        [HttpPost("Download")]
        public async Task<IActionResult> DownloadQueriesAsExcel([FromBody] FilterRequestModel filters)
        {
            try
            {
                // Validate the request
                if (filters.filters.Count == 0)
                {
                    return BadRequest(new { message = "The list of filters cannot be null or empty.", status = false });
                }

                // var userData = await _queryRepository.GetUsersFromExternalApi(filters.projectId);
                //
                // foreach (var Udata in userData)
                // {
                //     var sync = await _queryRepository.SyncUserData(Udata);
                // }

                var data = await _queryRepository.GetQueries(filters, false);

                // ✅ Only include selected keys
                var allowedKeys = new List<string> { "title", "query", "category_name", "sub_category_name", "response_type" };

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Queries");

                if (data.Count > 0)
                {
                    // Write header
                    int colIndex = 1;
                    foreach (var key in allowedKeys)
                    {
                        worksheet.Cells[1, colIndex++].Value = key;
                    }

                    // Write data
                    for (int i = 0; i < data.Count; i++)
                    {
                        int j = 1;
                        foreach (var key in allowedKeys)
                        {
                            data[i].TryGetValue(key, out var val);
                            string value = val?.ToString();

                            // 🧼 Clean HTML for 'query' column
                            if (key == "query")
                                value = StripHtml(value);

                            worksheet.Cells[i + 2, j++].Value = value;
                        }
                    }
                }

                var excelBytes = package.GetAsByteArray();
                var fileName = $"Queries_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(excelBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generating Excel: {ex.Message}");
            }
        }

        private static string StripHtml(string input)
        {
            return string.IsNullOrEmpty(input)
                ? string.Empty
                : Regex.Replace(input, "<.*?>", string.Empty);
        }
        
        [HttpPost("RetrieveSubQueries")]
        public async Task<IActionResult> GetSubQueries([FromBody] FilterSubQueriesModel filters)
        {
            try
            {
                // Validate the request
                if (filters.queryId == 0)
                {
                    return BadRequest(new { message = "The list of filters cannot be null or empty.", statuApproveDraftQuerys = false });
                }
                
                // var userData = await _queryRepository.GetUsersFromExternalApi(filters.projectId);
                //
                // foreach (var Udata in userData)
                // {
                //     var sync = await _queryRepository.SyncUserData(Udata);
                // }

                // Call the repository
                var data = await _queryRepository.GetSubQueries(filters, false);

                bool status = data.Count > 0;

                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Sub Queries fetched successfully",
                        queries = data,
                        error = error
                    });
                }

                return NotFound(new { message = "No Sub Queries found for the provided filters.", status = status, error = error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving Sub Queries data.");
                return StatusCode(500, new { message = "An error occurred while retrieving Sub Queries data.", error = ex.Message, status = false });
            }
        }

        [HttpPost("RetrieveSubQueriesForAdmin")]
        public async Task<IActionResult> GetSubQueriesForAdmin([FromBody] FilterSubQueriesModel filters)
        {
            try
            {
                // Validate the request
                if (filters.queryId == 0)
                {
                    return BadRequest(new { message = "The list of filters cannot be null or empty.", statuApproveDraftQuerys = false });
                }

                // var userData = await _queryRepository.GetUsersFromExternalApi(filters.projectId);
                //
                // foreach (var Udata in userData)
                // {
                //     var sync = await _queryRepository.SyncUserData(Udata);
                // }

                // Call the repository
                var data = await _queryRepository.GetSubQueries(filters, true);

                bool status = data.Count > 0;

                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Sub Queries fetched successfully",
                        queries = data,
                        error = error
                    });
                }

                return NotFound(new { message = "No Sub Queries found for the provided filters.", status = status, error = error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving Sub Queries data.");
                return StatusCode(500, new { message = "An error occurred while retrieving Sub Queries data.", error = ex.Message, status = false });
            }
        }
        
        [HttpPost("UpdateQueryStatus")]
        public async Task<IActionResult> UpdateQueryStatusController([FromBody] QueryUpdateRequest request)
        {
            try
            {
                // Validate request list
                if (request.query_id == null || request.query_id == 0 || request.status == null || request.status == 0)
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                var result = await _queryRepository.QueryStatusUpdate(request.query_id, request.status, request.user_id, request.user_name, request.reject_reason, request.title, request.query, request.edited_reason);


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data updated successfully",
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No details found for the provided data",
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while updating query status.");

                return StatusCode(500, new
                {
                    message = "An error occurred while updating query status.",
                    error = ex.Message,
                    status = false
                });
            }
        }

        [HttpGet("ResolveQUery")]
        public async Task<IActionResult> ResolveQuery(int query_id)
        {
            try
            {
                // Validate request list
                if (query_id == null || query_id == 0)
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                var result = await _queryRepository.ResolveQuery(query_id);
                
                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Query resolved successfully",
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No details found for the provided data",
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while resolving query status.");

                return StatusCode(500, new
                {
                    message = "An error occurred while resolving query status.",
                    error = ex.Message,
                    status = false
                });
            }
        }

        [HttpPost("RejectDraftQuery")]
        public async Task<IActionResult> RejectDraftQuery([FromBody] QueryUpdateRequest request)
        {
            try
            {
                // Validate request list
                if (request.query_id == null || request.query_id == 0)
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }


                var result = await _queryRepository.QueryStatusUpdate(request.query_id, 5, request.user_id, request.user_name, request.reject_reason, request.edited_reason, request.query, request.title );


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = $"{request.query_id} Query rejected",
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No draft queries found",
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while updating draft query status.");

                return StatusCode(500, new
                {
                    message = "Something went wrong while updating draft query status.",
                    error = ex.Message,
                    status = false
                });
            }
        }
        
        [HttpPost("ApproveDraftQuery")]
        public async Task<IActionResult> ApproveDraftQuery([FromBody] QueryUpdateRequest request)
        {
            try
            {
                // Validate request list
                if (request.query_id == null || request.query_id == 0)
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                var result = await _queryRepository.QueryStatusUpdate(request.query_id, 2, request.user_id, request.user_name, request.reject_reason,request.edited_reason, request.query, request.title );


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = $"{request.query_id} Query approved",
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No draft queries found",
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while updating draft query status.");

                return StatusCode(500, new
                {
                    message = "Something went wrong while updating draft query status.",
                    error = ex.Message,
                    status = false
                });
            }
        }
        
        [HttpGet]
        [Route("GetQueryCounts")]
        public async Task<IActionResult> GetQueryCountsController(int projectId)
        {
            try
            {
                // Fetch data from the repository
                var queryCountsResult = await _queryRepository.GetQueryCounts(projectId);

                // Transform data into the required structure
                var result = new
                {
                    status = queryCountsResult.StatusCounts,
                    aging = queryCountsResult.AgingCounts,
                    criticality = queryCountsResult.CriticalityCounts
                };

                return Ok(result);
            }
            catch (System.Exception ex)
            {
                // Handle errors and return a meaningful response
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
      
        [HttpPost("InsertSubQueryDocLinkData")]
        public async Task<IActionResult> InsertSubQueryDocLinkController([FromBody] SubQueryDocLinkModel request)
        {
            try
            {
                // Validate request list
                if (request.parent_query_id == -1 || request.parent_query_id == 0) 
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                // Create a list to store responses from 
                List<AddEdit> combinedResponses = new List<AddEdit>();

                var result = await _queryRepository.InsertSubQueryDocLink(request, false);


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data inserted successfully",
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No details found for the provided data",
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while inserting sub query.");

                return StatusCode(500, new
                {
                    message = "An error occurred while inserting sub query.",
                    error = ex.Message,
                    status = false
                });
            }
        }

        [HttpPost("InsertSubQueryDocLinkDataClient")]
        public async Task<IActionResult> InsertSubQueryDocLinkClientController([FromBody] SubQueryDocLinkModel request)
        {
            try
            {
                // Validate request list
                if (request.parent_query_id == -1 || request.parent_query_id == 0)
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                // Create a list to store responses from 
                List<AddEdit> combinedResponses = new List<AddEdit>();

                var result = await _queryRepository.InsertSubQueryDocLink(request, true);


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data inserted successfully",
                        error = error
                    });
                }

                return NotFound(new
                {
                    message = "No details found for the provided data",
                    status = false,
                    error = error
                });
            }
            catch (Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while inserting sub query.");

                return StatusCode(500, new
                {
                    message = "An error occurred while inserting sub query.",
                    error = ex.Message,
                    status = false
                });
            }
        }

        [HttpGet("GetQueryTemplates")]
        public async Task<IActionResult> GetQueryTemplatesController()
        {
            try
            {
                // Fetch data from the repository
                var templates = await _queryRepository.GetQueryTemplates();
                bool status = templates.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        templates = templates,
                        error = error
                    });
                }

                return Ok(new { message = "No query templates available.", status = status, error = error });
            }
            catch (System.Exception ex)
            {
                // Handle errors and return a meaningful response
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
        
        [HttpGet("GetQueryTemplate")]
        public async Task<IActionResult> GetQueryTemplateController(int id)
        {
            try
            {
                // Fetch data from the repository
                var template = await _queryRepository.GetQueryTemplate(id);
                bool status = template.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        templates = template,
                        error = error
                    });
                }

                return Ok(new { message = "No query template available.", status = status, error = error });
            }
            catch (System.Exception ex)
            {
                // Handle errors and return a meaningful response
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("InsertQueryTemplate")]
        public async Task<IActionResult> InsertQueryTemplateController([FromBody] QueryTemplate request)
        {
            try
            {
                // Validate request list
                if (request.query == "" || request.title == "") 
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                // Create a list to store responses from 
                List<AddEdit> combinedResponses = new List<AddEdit>();

                var result = await _queryRepository.SaveQueryTemplate(request);


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Query template inserted successfully",
                        error = error
                    });
                }

                return StatusCode(500, new
                {
                    message = result.message,
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while inserting query template.");

                return StatusCode(500, new
                {
                    message = "An error occurred while inserting query template.",
                    error = ex.Message,
                    status = false
                });
            }
        }

        [HttpPost("UpdateQueryTemplate")]
        public async Task<IActionResult> UpdateQueryTemplateController([FromBody] QueryTemplate request)
        {
            try
            {
                // Validate request list
                if (request.query == "" || request.title == "") 
                {
                    return BadRequest(new { message = "Request list is empty", status = false });
                }

                // Create a list to store responses from 
                List<AddEdit> combinedResponses = new List<AddEdit>();

                var result = await _queryRepository.UpdateQueryTemplate(request);


                // Check if any data was inserted and construct the response
                bool status = result.statusCode == 200;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if (status)
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Query template updated successfully",
                        error = error
                    });
                }

                return StatusCode(500, new
                {
                    message = result.message,
                    status = false,
                    error = error
                });
            }
            catch(Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "An error occurred while updating query template.");

                return StatusCode(500, new
                {
                    message = "An error occurred while updating query template.",
                    error = ex.Message,
                    status = false
                });
            }
        }

        [HttpPost("GetDraftQueries")]
        public async Task<IActionResult> GetDraftQueriesController(int userId, int clientId)
        {
            try
            {
                var jobdata = await _queryRepository.GetDraftQueries(userId, clientId);

                //var groupedData = _queryRepository.GroupSubQueriesByJobId(jobdata);


                bool status = jobdata.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if ((jobdata != null) && (jobdata.Count > 0))
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        queries = jobdata,
                        error = error
                    });
                }

                return NotFound(new { message = "No draft queries found.", status = status, error = error });

            }
            catch (Exception ex)
            {
                // Use logger to log the error
                _logger.LogError(ex, "An error occurred while retrieving draft queries.");

                return StatusCode(500, new { message = "An error occurred while retrieving draft queries.", error = ex.Message, status = false });

            }
        }


        [HttpGet("RetrieveApproverJobDetails")]
        public async Task<IActionResult> GetApproverJobDetailsController(int userId, int clientId, int queryStatusId, int queryCriticalityId, int querycategoryId, int querySubCategoryId)
        {
            try
            {
                var jobdata = await _queryRepository.GetJobDetailsApprover(userId, clientId, queryStatusId, queryCriticalityId, querycategoryId, querySubCategoryId);

                bool status = jobdata.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if ((jobdata != null) && (jobdata.Count > 0))
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        queries = jobdata,
                        error = error
                    });
                }

                return Ok(new { message = "No Job details found for the provided ID.", status = status, error = error });

            }
            catch (Exception ex)
            {
                // Use logger to log the error
                _logger.LogError(ex, "An error occurred while retrieving Job details.");

                return StatusCode(500, new { message = "An error occurred while retrieving Job details.", error = ex.Message, status = false });

            }
        }


        [HttpPost("GetDraftSubQueries")]
        public async Task<IActionResult> GetDraftSubQueriesController(int userId, int clientId)
        {
            try
            {
                var jobdata = await _queryRepository.GetDraftSubQueries(userId, clientId);

                bool status = jobdata.Count > 0;
                var error = new
                {
                    errorCode = 0,
                    errorMessage = ""
                };

                if ((jobdata != null) && (jobdata.Count > 0))
                {
                    return Ok(new
                    {
                        status = status,
                        message = "Data fetched Successfully",
                        queries = jobdata,
                        error = error
                    });
                }

                return NotFound(new { message = "No draft sub queries found.", status = status, error = error });

            }
            catch (Exception ex)
            {
                // Use logger to log the error
                _logger.LogError(ex, "An error occurred while retrieving draft sub queries.");

                return StatusCode(500, new { message = "An error occurred while retrieving draft sub queries.", error = ex.Message, status = false });

            }
        }
    }
}
