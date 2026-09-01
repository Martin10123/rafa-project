import { createBrowserRouter } from 'react-router'
import { AdminLayout } from '@/app/layouts/AdminLayout'
import { StoreLayout } from '@/app/layouts/StoreLayout'
import { RequireAdmin } from '@/features/auth/guards'
import { AdminGalleryPage } from '@/pages/AdminGalleryPage'
import { AdminHomePage } from '@/pages/AdminHomePage'
import { AdminInventoryPage } from '@/pages/AdminInventoryPage'
import { AdminAuthLogsPage } from '@/pages/AdminAuthLogsPage'
import { AdminPaymentsPage } from '@/pages/AdminPaymentsPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { GalleryDetailPage } from '@/pages/GalleryDetailPage'
import { GalleryPage } from '@/pages/GalleryPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage, RouteErrorPage } from '@/pages/NotFoundPage'
import { ProductPage } from '@/pages/ProductPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: StoreLayout,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, Component: HomePage },
      { path: 'login', Component: LoginPage },
      { path: 'galeria', Component: GalleryPage },
      { path: 'galeria/:showcaseId', Component: GalleryDetailPage },
      { path: 'carrito', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'producto/:beadSize', Component: ProductPage },
      { path: '403', Component: ForbiddenPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '/admin',
    Component: RequireAdmin,
    errorElement: <RouteErrorPage />,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminHomePage },
          { path: 'inventario', Component: AdminInventoryPage },
          { path: 'galeria', Component: AdminGalleryPage },
          { path: 'pagos', Component: AdminPaymentsPage },
          { path: 'logs', Component: AdminAuthLogsPage },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
