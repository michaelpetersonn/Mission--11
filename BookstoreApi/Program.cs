using BookstoreApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var databasePath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "Bookstore.sqlite"));

builder.Services.AddControllers();
builder.Services.AddDbContext<BookstoreContext>(options => options.UseSqlite($"Data Source={databasePath}"));
builder.Services.AddCors(options =>
{
    options.AddPolicy("vite", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "https://calm-sky-0209edf1e.1.azurestaticapps.net")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("vite");
app.UseAuthorization();

app.MapControllers();

app.Run();
