# IS 413 — Mission 11: Online Bookstore

Name: Michael Peterson  
Course: IS 413

## Overview
Mission 11 builds an online bookstore app using an ASP.NET Core Web API + React front end backed by a SQLite database.

## Requirements (Checklist)
- [ ] Create a web app for an online bookstore.
- [ ] Store these fields for each book:
  - [ ] Title
  - [ ] Author
  - [ ] Publisher
  - [ ] ISBN
  - [ ] Classification/Category
  - [ ] Number of Pages
  - [ ] Price
- [ ] Connect the provided SQLite database to the app (`Bookstore.sqlite`).
- [ ] Ensure models match the database tables (database is prepopulated).
- [ ] Build a component/page that lists books from the database.
- [ ] Add pagination:
  - [ ] Default to 5 books per page.
  - [ ] Allow the user to change the number of results per page.
- [ ] Style the component using Bootstrap.
- [ ] Add sorting by book title (AI assistance allowed).

## Database
This repo includes the provided database file: `Bookstore.sqlite`.

## Step-by-Step Guide
These steps assume a typical setup: **ASP.NET Core Web API** for the backend + **React** for the frontend, using the provided **SQLite** database.

### 1) Create the projects
- Create a backend project (example):
  - `mkdir server && cd server`
  - `dotnet new webapi -n BookstoreApi`
- Create a React project (example with Vite):
  - `cd ..`
  - `npm create vite@latest client -- --template react`

### 2) Connect the SQLite database (backend)
- Copy `Bookstore.sqlite` into the backend project folder (example: `server/BookstoreApi/`).
- Add EF Core packages:
  - `dotnet add package Microsoft.EntityFrameworkCore.Sqlite`
  - `dotnet add package Microsoft.EntityFrameworkCore.Design`
  - `dotnet add package Microsoft.EntityFrameworkCore.Tools`
- Add a connection string in `appsettings.json` (example):
  - `Data Source=Bookstore.sqlite`
- Scaffold your models + DbContext from the existing database (from the backend project folder that contains `Bookstore.sqlite`):
  - `dotnet ef dbcontext scaffold "Data Source=Bookstore.sqlite" Microsoft.EntityFrameworkCore.Sqlite -o Models -c BookstoreContext --context-dir Data --use-database-names --no-onconfiguring`
- Register the DbContext in `Program.cs` (so controllers can query the DB).

### 3) Build the API endpoint(s)
- Create an endpoint to return books with pagination + sorting (example):
  - `GET /api/books?page=1&pageSize=5&sort=title`
- Return both:
  - The current page of books
  - Metadata needed for pagination (at least `totalCount`, and/or `totalPages`)
- Implement pagination in the query:
  - `Skip((page - 1) * pageSize).Take(pageSize)`
- Implement sorting by title in the query:
  - `.OrderBy(b => b.Title)` (or the correct property name from your scaffolded model)

### 4) Enable CORS (backend)
- Allow your React dev server origin (commonly `http://localhost:5173` for Vite, or `http://localhost:3000` for CRA).
- Add a simple CORS policy in `Program.cs` and apply it.

### 5) Build the React UI (frontend)
- Install Bootstrap:
  - `npm install bootstrap`
- Import Bootstrap CSS in `client/src/main.jsx` (or equivalent):
  - `import "bootstrap/dist/css/bootstrap.min.css";`
- Create a book list page/component that:
  - Fetches data from the API
  - Displays the required fields (Title, Author, etc.)
  - Shows pagination controls
  - Lets the user pick `pageSize` (default 5)
  - Lets the user sort by title (button/toggle or clickable column header)

### 6) Verify requirements end-to-end
- Confirm the DB is being used (you should see prepopulated books).
- Confirm:
  - Page size defaults to 5
  - Changing page size refetches + updates results
  - Pagination works for multiple pages
  - Sorting by title changes order
  - Styling uses Bootstrap components/classes

### 7) Submit
- Push to GitHub.
- Submit the GitHub repo link in Learning Suite.

## Running the App
Once the API and React app are in place, run them from their respective folders:

- API (example):
  - `dotnet restore`
  - `dotnet run`
- Client (example):
  - `npm install`
  - `npm start`

If your project uses different commands (Vite, `npm run dev`, etc.), update this section accordingly.

## Submission
Submit a link to the GitHub repository for this assignment in Learning Suite.
