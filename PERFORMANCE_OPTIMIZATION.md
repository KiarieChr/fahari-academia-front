# Frontend Performance Optimization Guide

## Current Optimizations Implemented

### 1. LazyImage Component
- **Location**: `src/components/common/LazyImage.jsx`
- **Features**:
  - Uses Intersection Observer API for native lazy loading
  - Shows loading skeleton while image loads
  - Automatic 50px margin for preloading before viewport entry
  - Fallback to load immediately on older browsers
  - Prevents layout shift with aspect ratio containers
  - Shows error state gracefully

**Usage**:
```jsx
import LazyImage from '../components/common/LazyImage';

<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  aspectRatio="aspect-square"  // or aspect-video, aspect-[4/3]
  className="rounded-lg"
  placeholderBg="bg-gray-200"
/>
```

### 2. ProfilePictureUpload Component
- **Location**: `src/modules/users/components/ProfilePictureUpload.jsx`
- **Features**:
  - Image preview before upload
  - File size validation (max 5MB)
  - File type validation
  - Progress indicator during upload
  - Remove/reset functionality

### 3. Passport Photo in ApplicationDetailsModal
- **Location**: `src/modules/students/admission/components/ApplicationDetailsModal.jsx`
- **Features**:
  - Lazy loads passport photos
  - Shows profile photo in modal with aspect ratio preservation

## Pages Identified as Potentially Slow

1. **AdmissionBookDashboard** - Multiple tabs with large tables
2. **StudentManagement** - Stats cards, charts, and data-heavy sections
3. **Reports pages** - Large data tables, charts
4. **HR Settings** - Heavy form components

## Optimization Strategies

### A. Image Optimization
1. **Already Implemented**:
   - LazyImage component with Intersection Observer
   - Automatic placeholder display
   - Loading indicators

2. **To Do**:
   - Replace all hardcoded `<img>` tags with `<LazyImage>` component
   - Add `srcSet` and `sizes` attributes for responsive images
   - Compress images (JPEG ~70-80% quality, PNG with optimization)

### B. Code Splitting & Route-based Lazy Loading
Currently implemented via `React.lazy()` in `App.jsx` for:
- All module routes (StudentManagement, HR, etc.)

To verify: Check `App.jsx` for all `lazy(() => import(...))` patterns

### C. Component Optimization

1. **Memoization**:
```jsx
// Use memo for components that don't need frequent re-renders
const ExpensiveComponent = React.memo(({ data }) => (
  // component
));
```

2. **useCallback for event handlers**:
```jsx
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

3. **useMemo for expensive computations**:
```jsx
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### D. Bundle Size Analysis
Run to check bundle size:
```bash
npm run build -- --report
```

### E. Data Fetching Optimization

1. **Pagination**: Already implemented on tables (ApplicationsTable, etc.)
2. **API optimization**:
   - Implement `select` query parameters to fetch only needed fields
   - Use filtering/search on backend instead of frontend
   - Add request debouncing for search inputs

3. **Caching**:
   - Implement localStorage caching for static data
   - Add response caching headers on backend

### F. CSS & Styling Optimization

1. **Current**: Using Tailwind (already optimized with PurgeCSS)
2. **Recommendation**: 
   - Ensure `tailwind.config.js` has correct purge paths
   - Check unused CSS is being removed in production build

### G. React-specific Optimization

1. **Virtual Scrolling**: For large lists
   - Use `react-window` or `react-virtual` for tables with 100+ rows

2. **Windowing (already used in some components)**:
   - Check `ApplicantStatisticsSection` and other data tables

## Performance Monitoring

### Tools to Use:
1. **Chrome DevTools** → Lighthouse (built-in)
2. **WebPageTest** (webpagetest.org)
3. **React DevTools Profiler**

### Metrics to Monitor:
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **FID** (First Input Delay): < 100ms

### Steps to Profile:
1. Open Chrome DevTools → Performance tab
2. Click record, perform action, stop recording
3. Analyze flame chart for bottlenecks
4. Look for long tasks (>50ms)

## Recommended Implementation Order

1. **Phase 1** (Critical - Do First):
   - [ ] Replace all `<img>` tags with `<LazyImage>` in high-traffic pages
   - [ ] Enable code splitting verification
   - [ ] Run Lighthouse audit

2. **Phase 2** (Important):
   - [ ] Add React.memo to large table components
   - [ ] Implement useCallback/useMemo for event handlers
   - [ ] Add pagination to all large lists (if not already done)

3. **Phase 3** (Nice to Have):
   - [ ] Implement virtual scrolling for huge lists (1000+ items)
   - [ ] Add image CDN/compression pipeline
   - [ ] Implement service worker for offline caching

## Quick Wins (Implement Today)

### 1. Add LazyImage to Common Pages
Search for all `<img` tags in these files and replace with `<LazyImage>`:
```bash
grep -r "<img " src/modules/ | head -20
```

### 2. Memoize Table Components
```jsx
const ApplicationsTable = React.memo(() => {
  // component body
});

export default ApplicationsTable;
```

### 3. Add Loading States
- Ensure all API calls show loading indicators
- Use skeleton loaders for data tables

### 4. Defer Non-Critical Rendering
Use `Suspense` boundaries for tabs/sections that aren't immediately visible:
```jsx
<Suspense fallback={<LoadingSkeleton />}>
  <TabContent />
</Suspense>
```

## Pages to Optimize (Priority)

| Page | Issue | Priority | Solution |
|------|-------|----------|----------|
| AdmissionBookDashboard | Multiple charts + large ApplicationsTable | HIGH | Add virtual scrolling, lazy load tabs |
| StudentManagement | Heavy stats/charts on initial load | HIGH | Route-based code splitting, lazy load charts |
| Reports pages | Large data tables | MEDIUM | Pagination, virtual scrolling, export to CSV |
| Settings pages | Multiple sections loading simultaneously | MEDIUM | Lazy load sections, Suspense boundaries |
| MyAccount | Profile picture upload | LOW | Already optimized |

## Testing Changes

After implementing optimizations:
1. Run `npm run build`
2. Serve production build locally: `npx serve -s dist`
3. Open Chrome DevTools → Lighthouse
4. Run audit and compare scores
5. Check Network tab for waterfall chart improvements

---

**Last Updated**: April 23, 2026
**Contributors**: Performance Team
