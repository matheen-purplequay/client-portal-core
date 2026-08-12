using System.Text;

namespace WMAPI.QueryAPI.Utils;
using System.Security.Cryptography;

public class CodeGenerator
{
    public static int GenerateRandomCode()
    {
        // Generate a random 4-digit number
        return RandomNumberGenerator.GetInt32(1000, 10000); // Min inclusive, Max exclusive
    }
    
    public static string GetAlphaNumericCodeFromCurrentTimestamp()
    {
        // Get the current timestamp
        string timestampString = DateTime.Now.ToString("yyyyMMddHHmmss");

        // Generate a hash
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(timestampString));

            // Convert to alphanumeric string
            string hash = BitConverter.ToString(hashBytes).Replace("-", "");

            // Take the first 4 characters
            return hash.Substring(0, 4).ToUpper();
        }
    }
}
