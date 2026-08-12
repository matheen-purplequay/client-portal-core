using System.Text.Json.Nodes;

namespace WMAPI.Repositories.JsonRepository
{
    public class JsonRepository : IJsonRepository
    {
        public async Task<bool> CreateJsonFileAsync(string fileName, JsonNode jsonContent, string folderPathType, string clientId)
        {
            try
            {
                // Base directory of the application
                var baseDirectory = AppContext.BaseDirectory;

                // Root directory for the client
                var clientRootPath = Path.Combine(baseDirectory, "Clients", clientId);

                // Determine the specific subfolder based on folderPathType
                string subFolderPath = folderPathType.ToLower() switch
                {
                    "config" => Path.Combine(clientRootPath, "Config"),
                    "settings" => Path.Combine(clientRootPath, "Settings"),
                    "docs" => Path.Combine(clientRootPath, "Docs"),
                    _ => throw new ArgumentException("Invalid folderPathType.")
                };

                // Ensure the directory exists
                if (!Directory.Exists(subFolderPath))
                {
                    Directory.CreateDirectory(subFolderPath);
                }

                // Construct the full path for the JSON file
                var filePath = Path.Combine(subFolderPath, $"{fileName}.json");

                // Check if file already exists
                if (File.Exists(filePath))
                {
                    return false; // File already exists
                }

                // Write the JSON content to the file
                await File.WriteAllTextAsync(filePath, jsonContent.ToString());
                return true;
            }
            catch
            {
                return false; // Error occurred
            }
        }

        public async Task<bool> UpdateJsonFileAsync(string fileName, JsonNode updatedContent, string folderPathType, string clientId)
        {
            try
            {
                // Base directory of the application
                var baseDirectory = AppContext.BaseDirectory;

                // Root directory for the client
                var clientRootPath = Path.Combine(baseDirectory, "Client", clientId);

                // Determine the specific subfolder based on folderPathType
                string subFolderPath = folderPathType.ToLower() switch
                {
                    "config" => Path.Combine(clientRootPath, "Config"),
                    "settings" => Path.Combine(clientRootPath, "Settings"),
                    "docs" => Path.Combine(clientRootPath, "Docs"),
                    _ => throw new ArgumentException("Invalid folderPathType.")
                };

                // Construct the full path for the JSON file
                var filePath = Path.Combine(subFolderPath, $"{fileName}.json");

                // Check if file exists
                if (!File.Exists(filePath))
                {
                    return false; // File not found
                }

                // Write the updated content to the file
                await File.WriteAllTextAsync(filePath, updatedContent.ToString());
                return true;
            }
            catch
            {
                return false; // Error occurred
            }
        }
    }
}
