using MySql.Data.MySqlClient;
using System.Xml.Linq;

namespace WMAPI.Models.CommonModels
{
    public class AddEdit : IFill
    {
        public int statusCode { get; set; }
        public string? message { get; set; }
        public string? Id { get; set; }

        public void Fill(MySqlDataReader reader)
        {
            statusCode = reader["statusCode"] != DBNull.Value ? Convert.ToInt32(reader["Id"]) : 0;

            message = reader["message"] != DBNull.Value ? reader["Name"].ToString() : string.Empty;

            Id = reader["Id"] != DBNull.Value ? reader["Email"].ToString() : string.Empty;
        }
    }
}
