# Mission 12 Implementation Steps

Use this as your build order and final submission checklist.

## 1) Baseline: App Compiles and Runs (10 pts)
- [ ] Run backend and frontend with no build/runtime errors.
- [ ] Confirm API endpoints load and client page renders.
- [ ] Fix warnings/errors before adding features.

### Validation
- [ ] Backend starts successfully.
- [ ] Frontend starts successfully.
- [ ] Home page loads without console/API errors.

---

## 2) Add Category Filtering (20 pts)
- [ ] Make sure categories are available from API or book data source.
- [ ] Build category UI (buttons/dropdown/list).
- [ ] Track selected category in component state.
- [ ] Filter displayed books by selected category.
- [ ] Add an "All" option to clear filtering.

### Validation
- [ ] Selecting each category shows only matching books.
- [ ] "All" returns full list.
- [ ] No category selection errors.

---

## 3) Make Pagination Update with Filtering (5 pts)
- [ ] Recalculate total pages from the filtered result set.
- [ ] Reset to page 1 when filter changes.
- [ ] Ensure page controls only show valid page numbers.

### Validation
- [ ] Page count changes when category changes.
- [ ] No empty page states caused by stale page index.
- [ ] Next/Prev logic still works.

---

## 4) Build Cart State That Persists Across Navigation (25 pts)
- [ ] Create centralized cart state (Context/Provider or similar).
- [ ] Wrap app routes so cart state is available on all pages.
- [ ] Add "Add to Cart" behavior from book list.
- [ ] If same book is added again, increment quantity (do not duplicate separate lines).
- [ ] Persist cart to `localStorage` so refresh/navigation keeps state.

### Validation
- [ ] Cart survives route changes.
- [ ] Cart survives browser refresh.
- [ ] Quantity increments correctly for repeated adds.

---

## 5) Create Cart Page (10 pts)
- [ ] Add `/cart` route and cart page component.
- [ ] Show each line item with:
  - [ ] Title (or identifying book info)
  - [ ] Quantity
  - [ ] Line subtotal (`price * quantity`)
- [ ] Show cart total at the bottom.
- [ ] Add empty-cart message when no items exist.

### Validation
- [ ] Subtotals are mathematically correct.
- [ ] Total equals sum of subtotals.
- [ ] Re-adding a book updates quantity and totals correctly.

---

## 6) Add Cart Summary on Home Page (10 pts)
- [ ] Add compact cart summary component on home page.
- [ ] Show BOTH:
  - [ ] Total quantity of items
  - [ ] Total cart price
- [ ] Include link/button to go to cart page.

### Validation
- [ ] Summary updates immediately when items are added.
- [ ] Quantity and price are both present and correct.

---

## 7) Bootstrap Requirements (10 pts)
- [ ] Use Bootstrap Grid (`container`, `row`, `col-*`) for page layout.
- [ ] Add at least two additional Bootstrap features beyond grid.

### Suggested Bootstrap additions
- [ ] Cards for book display.
- [ ] Badges for cart count.
- [ ] Navbar for navigation.
- [ ] Buttons/Button groups for category filters.
- [ ] Pagination component styling.
- [ ] Alerts for cart actions.

### Validation
- [ ] Grid is clearly used in main layout.
- [ ] At least two non-grid Bootstrap components/utilities are visible.

---

## 8) Code Cleanliness (10 pts)
- [ ] Use clear component/function/variable names.
- [ ] Keep files organized by feature (books, cart, shared UI).
- [ ] Remove dead code and commented-out blocks.
- [ ] Add concise comments only where logic is not obvious.
- [ ] Keep consistent spacing/formatting.

### Validation
- [ ] Readability pass completed.
- [ ] No obvious duplication that should be refactored.

---

## 9) Final Rubric Self-Check Before Submission
- [ ] App compiles and runs.
- [ ] Category filter works.
- [ ] Pagination updates with filtering.
- [ ] Cart persists across navigation and refresh.
- [ ] Cart page shows quantity, subtotal, and total correctly.
- [ ] Home page cart summary shows quantity and price.
- [ ] Bootstrap grid + 2 additional Bootstrap items are present.
- [ ] Code is clean and organized.

## 10) Quick Demo Script (for grading)
- [ ] Launch app, show home page loads.
- [ ] Filter category and show page numbers update.
- [ ] Add same book twice, show quantity increment.
- [ ] Navigate to cart page, verify subtotal/total math.
- [ ] Return home and show cart summary still accurate.
- [ ] Refresh browser to prove persistence.
