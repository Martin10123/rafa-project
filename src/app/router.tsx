import { createBrowserRouter } from 'react-router'
import { AdminLayout } from '@/app/layouts/AdminLayout'
import { StoreLayout } from '@/app/layouts/StoreLayout'
import { RequireAdmin } from '@/features/auth/guards'
import { AdminHomePage } from '@/pages/AdminHomePage'
import { AdminInventoryPage } from '@/pages/AdminInventoryPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { HomePage } from '@/pages/HomePage'
import { ProductPage } from '@/pages/ProductPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: StoreLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'producto/:beadSize', Component: ProductPage },
      { path: '403', Component: ForbiddenPage },
    ],
  },
  {
    path: '/admin',
    Component: RequireAdmin,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminHomePage },
          { path: 'inventario', Component: AdminInventoryPage },
        ],
      },
    ],
  },
])
