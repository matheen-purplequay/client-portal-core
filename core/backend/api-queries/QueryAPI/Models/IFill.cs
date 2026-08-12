using MySql.Data.MySqlClient;

namespace WMAPI.Models
{
    public interface IFill
    {
        void Fill(MySqlDataReader reader);
    }
}
