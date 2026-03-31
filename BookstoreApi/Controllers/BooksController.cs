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
        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            var category = query.Category.Trim();
            booksQuery = booksQuery.Where(book => book.Category == category);
        }

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

    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCategories()
    {
        var categories = await context.Books
            .AsNoTracking()
            .Select(book => book.Category)
            .Where(category => !string.IsNullOrWhiteSpace(category))
            .Distinct()
            .OrderBy(category => category)
            .ToListAsync();

        return Ok(categories);
    }

    // POST /api/books — add a new book
    [HttpPost]
    public async Task<ActionResult<Book>> AddBook([FromBody] Book book)
    {
        context.Books.Add(book);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBooks), new { id = book.BookId }, book);
    }

    // PUT /api/books/{id} — update an existing book
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
    {
        if (id != book.BookId)
            return BadRequest("Book ID mismatch.");

        var existing = await context.Books.FindAsync(id);
        if (existing is null)
            return NotFound();

        existing.Title = book.Title;
        existing.Author = book.Author;
        existing.Publisher = book.Publisher;
        existing.ISBN = book.ISBN;
        existing.Classification = book.Classification;
        existing.Category = book.Category;
        existing.PageCount = book.PageCount;
        existing.Price = book.Price;

        await context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/books/{id} — delete a book
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await context.Books.FindAsync(id);
        if (book is null)
            return NotFound();

        context.Books.Remove(book);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
