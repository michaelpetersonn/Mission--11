using BookstoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BookstoreApi.Data;

public class BookstoreContext(DbContextOptions<BookstoreContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>(entity =>
        {
            entity.ToTable("Books");
            entity.HasKey(book => book.BookId);

            entity.Property(book => book.BookId).HasColumnName("BookID");
            entity.Property(book => book.Title).HasMaxLength(255);
            entity.Property(book => book.Author).HasMaxLength(255);
            entity.Property(book => book.Publisher).HasMaxLength(255);
            entity.Property(book => book.ISBN).HasMaxLength(50);
            entity.Property(book => book.Classification).HasMaxLength(100);
            entity.Property(book => book.Category).HasMaxLength(100);
            entity.Property(book => book.PageCount).HasColumnName("PageCount");
            entity.Property(book => book.Price).HasColumnType("REAL");
        });
    }
}
