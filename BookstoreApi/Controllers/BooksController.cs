using BookstoreApi.Data;
using BookstoreApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookstoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController(BookstoreContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedBooksResponse>> GetBooks([FromQuery] BookQueryParameters query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize switch
        {
            < 1 => 5,
            > 50 => 50,
            _ => query.PageSize
        };

        IQueryable<Book> booksQuery = context.Books.AsNoTracking();

        booksQuery = query.Sort.ToLowerInvariant() switch
        {
            "title_desc" => booksQuery.OrderByDescending(book => book.Title),
            _ => booksQuery.OrderBy(book => book.Title)
        };

        var totalCount = await booksQuery.CountAsync();
        var books = await booksQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedBooksResponse
        {
            Books = books,
            TotalCount = totalCount,
            CurrentPage = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }
}
