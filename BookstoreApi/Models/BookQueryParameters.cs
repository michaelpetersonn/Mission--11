namespace BookstoreApi.Models;

public class BookQueryParameters
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 5;
    public string Sort { get; set; } = "title";
    public string? Category { get; set; }
}
