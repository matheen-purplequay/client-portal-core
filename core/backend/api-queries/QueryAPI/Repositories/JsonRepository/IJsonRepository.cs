using System.Text.Json.Nodes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WMAPI.Repositories.JsonRepository
{
    public interface IJsonRepository
    {
        Task<bool> CreateJsonFileAsync(string fileName, JsonNode jsonContent, string folderPathType, string clientId);

        Task<bool> UpdateJsonFileAsync(string fileName, JsonNode updatedContent, string folderPathType, string clientId);
    }
}
