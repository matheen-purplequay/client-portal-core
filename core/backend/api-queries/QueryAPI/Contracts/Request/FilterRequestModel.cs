namespace WMAPI.Contracts.Request
{
    public class FilterRequestModel
    {
        public int jobId { get; set; }
        
        public List<RequestFilters> filters { get; set; }
        
        public int projectId { get; set; }
        
        public int userId { get; set; }
        
        public bool isAdmin { get; set; }
    }

    public class RequestFilters
    {
        public string code { get; set; }
        public int value { get; set; }
    }
}
