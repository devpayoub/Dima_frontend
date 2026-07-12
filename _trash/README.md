# _trash/

Orphaned files removed from active source during Phase 1 of the structure refactor.
None of these files were imported anywhere in the codebase at removal time
(verified via `grep` for each export name across the entire `front/` tree).

Safe to `rm -rf _trash/` once you're confident you won't need to recover any of them.
Git history retains every file if a recovery is ever required.

## Removed components (12)
- components/ArticlesPage.tsx
- components/CookiePolicyPage.tsx
- components/CookiePreferencesBanner.tsx
- components/CustomersPage.tsx
- components/GettingStartedArticlePage.tsx
- components/KioskMode.tsx
- components/PrivacyPolicyPage.tsx
- components/ResponsiveListView.tsx
- components/ShowcasePage.tsx
- components/SimpleCampaignEditModal.tsx
- components/TermsPage.tsx
- features/auth/LoginClassicPage.tsx

## Removed skeleton (1)
- components/skeletons/IssuedCardsSkeleton.tsx

## Removed data files (2)
- data/articles.ts
- data/articles.data.js

  (The article-data chain had only one consumer: components/ArticlesPage.tsx,
  which is itself orphaned above. Hence the chain is dead.)

Total: 15 files.
