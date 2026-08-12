using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;
using WMAPI.Repositories.JsonRepository;

namespace WMAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JsonController : ControllerBase
    {
        private readonly IJsonRepository _jsonRepository;

        public JsonController(IJsonRepository jsonRepository)
        {
            _jsonRepository = jsonRepository;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> CreateJsonFile(
            [FromQuery] string fileName,
            [FromQuery] string folderPathType,
            [FromQuery] string clientId,
            [FromBody] JsonNode jsonContent)
        {
            if (string.IsNullOrEmpty(fileName) || string.IsNullOrEmpty(folderPathType) || string.IsNullOrEmpty(clientId))
                return BadRequest(new { message = "File name, folder type, and client ID are required." });

            var result = await _jsonRepository.CreateJsonFileAsync(fileName, jsonContent, folderPathType, clientId);

            if (result)
                return Ok(new { message = "File created successfully." });

            return Conflict(new { message = "File already exists or an error occurred." });
        }

        [HttpPut("Update")]
        public async Task<IActionResult> UpdateJsonFile(
            [FromQuery] string fileName,
            [FromQuery] string folderPathType,
            [FromQuery] string clientId,
            [FromBody] JsonNode updatedContent)
        {
            if (string.IsNullOrEmpty(fileName) || string.IsNullOrEmpty(folderPathType) || string.IsNullOrEmpty(clientId))
                return BadRequest(new { message = "File name, folder type, and client ID are required." });

            var result = await _jsonRepository.UpdateJsonFileAsync(fileName, updatedContent, folderPathType, clientId);

            if (result)
                return Ok(new { message = "File updated successfully." });

            return NotFound(new { message = "File not found or an error occurred." });
        }
    }
}
