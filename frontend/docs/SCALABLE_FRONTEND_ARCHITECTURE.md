# Smart Student Productivity System - Scalable Frontend Blueprint

## Recommended Folder Structure

```txt
src/
  app/
    router/
    providers/
  context/
    AuthContext.jsx
  hooks/
    useAuth.js
  layouts/
    AppShell.jsx
  routes/
    ProtectedRoute.jsx
    RoleRoute.jsx
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    UnauthorizedPage.jsx
    NotFoundPage.jsx
    app/
      DashboardPage.jsx
      DeadlineReminderPage.jsx
      AIModulePage.jsx
      AdminPage.jsx
  components/
    shared/
  data/
    mockData.js
  lib/
  App.jsx
  main.jsx
```

## Required Components
- AuthProvider + `useAuth`
- `ProtectedRoute` for authenticated screens
- `RoleRoute` for admin-only pages
- `AppShell` (sidebar + content area)
- Dashboard widgets: tasks, progress, stats cards
- Deadline manager: form + calendar list + edit/delete actions
- AI assistant: prompt box + suggestion chips + query history
- Admin panel: student table/list + activity logs
- `UnauthorizedPage` and `NotFoundPage`

## Sample Patterns

### Protected Route
```jsx
<Route element={<ProtectedRoute />}>
  <Route element={<AppShell />}>
    <Route path="/dashboard" element={<DashboardPage />} />
  </Route>
</Route>
```

### Admin Access
```jsx
<Route element={<RoleRoute allowedRoles={['admin']} />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
```

## Clean UI/UX Suggestions
- Use a calm base palette (`slate`) + one primary accent (`indigo`).
- Keep cards consistent (`rounded-2xl`, white background, subtle border).
- Mobile-first spacing with responsive grids.
- Use concise microcopy and clear CTA hierarchy.
- Show empty states and loading states for every panel.

## Best Practices (Production Ready)
- Route-level lazy loading (`React.lazy`, `Suspense`).
- Persist auth in secure storage and validate token refresh strategy.
- Move API calls to service modules (`lib/api/*`).
- Add role claims in JWT payload and enforce in backend middleware.
- Add unit tests for hooks/routes and integration tests for critical flows.
- Track performance (Core Web Vitals, bundle analysis, code splitting).
- Add error boundaries + centralized toast/error feedback.
