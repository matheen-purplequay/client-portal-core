namespace WMAPI.Contracts.Request
{
    public class InsertDocLinkModel
    {
        public string title { get; set; }
       public string link { get; set; }
       public int user_id { get; set; }
       public int query_id { get; set; }
    }
}
