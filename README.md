# IS 413 — Mission 11: Online Bookstore

Name: Michael Peterson  
Course: IS 413

## Overview
Mission 11 is now set up as an ASP.NET Core Web API backend plus a Vite + React frontend backed by the provided SQLite database.

## Requirements (Checklist)
- [x] Create a web app for an online bookstore.
- [x] Store these fields for each book: Title, Author, Publisher, ISBN, Classification, Category, PageCount, Price.
- [x] Connect the provided SQLite database to the app (`Bookstore.sqlite`).
- [x] Ensure models match the database table structure.
- [x] Build a component/page that lists books from the database.
- [x] Add pagination with a default page size of 5.
- [x] Allow the user to change the number of results per page.
- [x] Style the frontend with Bootstrap.
- [x] Add sorting by book title.
- [ ] Submit the GitHub repository link in Learning Suite.

## Database
This repo includes the provided database file: `Bookstore.sqlite`.

## Project Structure
- `Bookstore.sqlite` contains the provided `Books` table and seed data.
- `BookstoreApi/` contains the .NET backend.
- `client/` contains the Vite + React frontend.

## Backend
- The API project is `BookstoreApi`.
- EF Core connects directly to `../Bookstore.sqlite`, so the database stays at the repo root.
- The main endpoint is:
  - `GET /api/books?page=1&pageSize=5&sort=title`
- Supported sort values:
  - `title`
  - `title_desc`
- Response includes:
  - `books`
  - `totalCount`
  - `currentPage`
  - `pageSize`
  - `totalPages`

## Frontend
- The frontend is a Vite React app in `client/`.
- Bootstrap is used for layout and component styling.
- The UI supports:
  - Book table display
  - Sorting by title
  - Page size selection
  - Previous/next pagination
- The frontend calls the API at:
  - `http://localhost:5074`
- You can override that with:
  - `VITE_API_BASE_URL`

## Steps to Complete the Assignment
1. Open a terminal in `BookstoreApi/` and run `dotnet restore`.
2. Start the backend with `dotnet run`.
3. Open a second terminal in `client/` and run `npm install`.
4. Start the frontend with `npm run dev`.
5. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.
6. Confirm the page loads books from the SQLite database.
7. Verify the default page size is 5.
8. Change the results-per-page dropdown and confirm the table updates.
9. Click the sort button and confirm titles switch between ascending and descending order.
10. Test the Previous and Next buttons across multiple pages.
11. If needed, update styling or text to match your professor's expectations.
12. Push the finished project to GitHub and submit that repo link in Learning Suite.

## Running the App
- Backend:
  - `cd BookstoreApi`
  - `dotnet restore`
  - `dotnet run`
- Frontend:
  - `cd client`
  - `npm install`
  - `npm run dev`

Vite typically runs at `http://localhost:5173`, and the API runs at `http://localhost:5074`.

## Notes
- `npm run build` succeeds for the frontend.
- `dotnet build` succeeds for the backend.
- Vite warns about the `#` character in the folder name `Water Project #1`; the app still builds, but renaming the parent folder would remove that warning.

## Submission
Submit a link to the GitHub repository for this assignment in Learning Suite.
