namespace WMAPI.Models.QueryModels;

public class QueryCountsResult
{
    public List<QueryCount> StatusCounts { get; set; }
    public List<QueryCount> AgingCounts { get; set; }
    public List<QueryCount> CriticalityCounts { get; set; }
}