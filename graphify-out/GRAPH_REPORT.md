# Graph Report - rafa-project  (2026-10-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 551 nodes · 1600 edges · 19 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bae38c7d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- ProductDetail.tsx
- Button
- isSupabaseConfigured
- GalleryPanel.tsx
- AuthProvider.tsx
- logEventSafe
- router.tsx
- orders.ts
- package.json
- devDependencies
- compilerOptions
- components.json
- compilerOptions
- BeadSceneContent.tsx
- BeadViewerLazy.tsx
- vite.config.ts
- tsconfig.json
- scripts

## God Nodes (most connected - your core abstractions)
1. `Button()` - 51 edges
2. `cn()` - 47 edges
3. `isSupabaseConfigured()` - 32 edges
4. `ShowcaseEditor()` - 29 edges
5. `logEventSafe()` - 28 edges
6. `react` - 28 edges
7. `DetailContent()` - 21 edges
8. `Input()` - 21 edges
9. `Label()` - 21 edges
10. `compilerOptions` - 21 edges

## Surprising Connections (you probably didn't know these)
- `StoreLayout()` --calls--> `Button()`  [EXTRACTED]
  src/app/layouts/StoreLayout.tsx → src/components/ui/button.tsx
- `StoreLayout()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/layouts/StoreLayout.tsx → src/features/auth/useAuth.ts
- `ShowcaseEditor()` --calls--> `Badge()`  [EXTRACTED]
  src/features/admin/GalleryPanel.tsx → src/components/ui/badge.tsx
- `ShowcaseCard()` --calls--> `Badge()`  [EXTRACTED]
  src/features/gallery/ShowcaseCard.tsx → src/components/ui/badge.tsx
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (19 total, 0 thin omitted)

### Community 0 - "cn"
Cohesion: 0.08
Nodes (49): lucide-react@^1.37.0, @base-ui/react, lucide-react, StoreLayout(), Badge(), badgeVariants, CardAction(), Carousel() (+41 more)

### Community 1 - "ProductDetail.tsx"
Cohesion: 0.11
Nodes (39): addBlockedReason(), AddCartLineInput, AddToCartResult, canAddPresentation(), cartItemCount(), CartLine, cartLineKey(), cartSubtotalCents() (+31 more)

### Community 2 - "Button"
Cohesion: 0.12
Nodes (26): react, Props, State, AdminLayout(), Button(), buttonVariants, Input(), Label() (+18 more)

### Community 3 - "isSupabaseConfigured"
Cohesion: 0.11
Nodes (36): createInventoryMovement(), getStockMap(), listInventoryMovements(), listStockAvailable(), mapMovement(), mapStock(), MovementRowDb, StockRowDb (+28 more)

### Community 4 - "GalleryPanel.tsx"
Cohesion: 0.12
Nodes (36): assertClient(), createShowcase(), deleteShowcase(), deleteShowcaseImage(), getPublishedShowcase(), ImageRow, listAdminShowcases(), listPublishedShowcases() (+28 more)

### Community 5 - "AuthProvider.tsx"
Cohesion: 0.09
Nodes (25): react-dom@^19.2.8, @tanstack/react-query@^5.102.8, react-dom, @supabase/supabase-js, @tanstack/react-query, App(), AppErrorBoundary, createAppQueryClient() (+17 more)

### Community 6 - "logEventSafe"
Cohesion: 0.08
Nodes (31): listAuthEventLogs(), currentRoute(), listEventLogs(), logEvent(), logEventSafe(), LogRow, mapLog(), AUTH_LOG_EVENTS (+23 more)

### Community 7 - "router.tsx"
Cohesion: 0.22
Nodes (24): react-router, Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), GalleryPanel() (+16 more)

### Community 8 - "orders.ts"
Cohesion: 0.11
Nodes (31): assertClient(), createStoreOrder(), isOrderStatus(), isProofStatus(), ItemRow, listPendingPaymentReviews(), mapItem(), mapOrder() (+23 more)

### Community 9 - "package.json"
Cohesion: 0.08
Nodes (31): dependencies, @base-ui/react@^1.7.0, class-variance-authority@^0.7.1, clsx@^2.1.1, embla-carousel-react@^8.6.0, @fontsource/inter@^5.3.0, @fontsource-variable/geist@^5.3.0, @fontsource-variable/inter@^5.3.0 (+23 more)

### Community 10 - "devDependencies"
Cohesion: 0.09
Nodes (25): devDependencies, eslint@^10.9.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.4, globals@^17.11.0, tailwindcss@^4.3.3, @types/node@^24.13.3 (+17 more)

### Community 11 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+14 more)

### Community 12 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 13 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 14 - "BeadSceneContent.tsx"
Cohesion: 0.20
Nodes (14): @react-three/drei@^10.7.8, @react-three/fiber@^9.7.0, @react-three/drei, @react-three/fiber, BeadSize, beadRadius(), BeadSceneContent(), BeadStrand() (+6 more)

### Community 15 - "BeadViewerLazy.tsx"
Cohesion: 0.39
Nodes (6): CatalogGrid(), BeadViewerLazy, BeadViewerSuspense(), Props, CatalogHero3D(), HomePage()

### Community 16 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.2.2, @vitejs/plugin-react@^6.1.0, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 17 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 18 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Button` to `cn`, `ProductDetail.tsx`, `isSupabaseConfigured`, `GalleryPanel.tsx`, `AuthProvider.tsx`, `router.tsx`, `package.json`, `BeadSceneContent.tsx`, `BeadViewerLazy.tsx`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.08294930875576037 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `cn`, `ProductDetail.tsx`, `isSupabaseConfigured`, `GalleryPanel.tsx`, `AuthProvider.tsx`, `logEventSafe`, `router.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `ProductDetail.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11346938775510204 - nodes in this community are weakly interconnected._
- **Why does `react-router` connect `router.tsx` to `cn`, `ProductDetail.tsx`, `Button`, `AuthProvider.tsx`, `package.json`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.11945031712473574 - nodes in this community are weakly interconnected._
- **Should `isSupabaseConfigured` be split into smaller, more focused modules?**
  _Cohesion score 0.10993657505285412 - nodes in this community are weakly interconnected._