## Packages
recharts | Dashboard analytics charts for sales and inventory trends
date-fns | Formatting dates in tables and reports

## Notes
Authentication uses session-based auth with /api/user, /api/login, /api/logout.
Dashboard requires complex data visualization, so recharts is essential.
All API requests must include `credentials: "include"` to handle session cookies.
