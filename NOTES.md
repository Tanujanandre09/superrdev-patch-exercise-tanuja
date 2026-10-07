# NOTES

## Summary of changes

1. **SQL AND/OR precedence (backend + `db/` SQL)** – `AND` binds tighter than `OR`, so archived tasks leaked into results and the status filter was ignored for title matches. Added parentheses around the title/description `OR`. Same fix in `search_tasks.sql` and the Oracle package.
2. **Artificial delay removed** – the controller slept up to 1 s per request (longest for empty searches). Deleted.
3. **Invalid `status` returned 500** – `TaskStatus.valueOf` threw. Now returns 400 with allowed values.
4. **Paging params not validated** – `page=0` gave a negative `subList` index (500). Clamped `page >= 1`, `1 <= pageSize <= 100`.
5. **Frontend error state hidden** – on failure `loading` stayed `true`, so "Loading…" showed forever and the error never appeared; old errors were also never cleared.
6. **Race condition** – out-of-order responses could overwrite newer results. Added `AbortController` cleanup in `useTasks`.
7. **Page not reset on filter change** – user could sit on page 4 of a 1-page result ("No tasks found"). Reset to page 1.
8. **Debounced search** (300 ms) – one request per pause, not per keystroke.
9. Minor: SLF4J logging instead of `System.out`, stable sort (`id DESC` tiebreaker), Oracle `v_term` size fixed (257 chars overflowed).

## Not changed (and why)
- Pagination is still done in memory (`subList`). Correct now, but loads all rows. Moving to `Pageable`/`LIMIT OFFSET` is a bigger change.
- `%`/`_` in search terms are not escaped (treated as wildcards). Low impact.
- `status` is a `String` column, not an enum/constraint.
- No tests added – timebox.

## Biggest remaining risk
In-memory pagination + leading-wildcard `LIKE '%term%'` (no index can help) → full table scans that get slower as data grows.

## Assumptions
- Archived tasks must never appear in search.
- Status filter is case-insensitive; unknown status is a client error.

## Tools / AI used
Used Claude to review the code and draft fixes. I reproduced the SQL bug by running the old vs fixed query against the seed data, and verified the frontend builds. I reviewed and understood each change.
