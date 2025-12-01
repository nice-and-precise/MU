- **Infrastructure**: Moving to Edge Functions requires Supabase configuration.

## Proposed Changes

### Configuration
#### [MODIFY] [package.json](file:///C:/Users/Owner/Desktop/MU/package.json)
- Update `dev` script to use `--turbo` or ensure `dev:turbo` is used.

#### [MODIFY] [next.config.ts](file:///C:/Users/Owner/Desktop/MU/next.config.ts)
- Add image optimization config.
- Add TypeScript and ESLint ignore for dev.

### Database
#### [MODIFY] [schema.prisma](file:///C:/Users/Owner/Desktop/MU/prisma/schema.prisma)
- Add indexes to `Project`, `RodPass`, etc.

### 3D Components
#### [MODIFY] [src/app/dashboard/owner/drilling/page.tsx](file:///C:/Users/Owner/Desktop/MU/src/app/dashboard/owner/drilling/page.tsx)
- Implement `dynamic` import for 3D scene.

### Data Fetching
#### [MODIFY] [src/app/dashboard/projects/[id]/page.tsx](file:///C:/Users/Owner/Desktop/MU/src/app/dashboard/projects/[id]/page.tsx)
- Optimize `include` to `select`.
- Implement pagination.

## Verification Plan
### Automated Tests
- Run `npm run dev:turbo` to verify startup.
- Check browser console for errors.

### Manual Verification
- Verify 3D page load performance.
- Verify database query speed (network tab).
