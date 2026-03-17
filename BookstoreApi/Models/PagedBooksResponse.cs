namespace BookstoreApi.Models;

public class PagedBooksResponse
{
    public required IReadOnlyList<Book> Books { get; init; }
    public required int TotalCount { get; init; }
    public required int CurrentPage { get; init; }
    public required int PageSize { get; init; }
    public required int TotalPages { get; init; }
}
