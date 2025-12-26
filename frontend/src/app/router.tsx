import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../components/MainLayout'
import { HomePage } from '../features/home/HomePage'
import { ProductsPage } from '../features/products/ProductsPage'
import { ProductDetailPage } from '../features/products/ProductDetailPage'
import { CartPage } from '../features/cart/CartPage'
import { CheckoutPage } from '../features/checkout/CheckoutPage'
import { OrderConfirmationPage } from '../features/checkout/OrderConfirmationPage'
import { OrdersPage } from '../features/orders/OrdersPage'
import { LoginPage } from '../features/auth/LoginPage'
import { SignupPage } from '../features/auth/SignupPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { AboutUsPage } from '../features/about/AboutUsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout><HomePage /></MainLayout>,
  },
  {
    path: '/products',
    element: <MainLayout><ProductsPage /></MainLayout>,
  },
  {
    path: '/products/:slug',
    element: <MainLayout><ProductDetailPage /></MainLayout>,
  },
  {
    path: '/about',
    element: <MainLayout><AboutUsPage /></MainLayout>,
  },
  {
    path: '/cart',
    element: <MainLayout><CartPage /></MainLayout>,
  },
  {
    path: '/checkout',
    element: <MainLayout><CheckoutPage /></MainLayout>,
  },
  {
    path: '/checkout/confirmation/:orderId',
    element: <MainLayout><OrderConfirmationPage /></MainLayout>,
  },
  {
    path: '/orders',
    element: <MainLayout><OrdersPage /></MainLayout>,
  },
  {
    path: '/auth/login',
    element: <MainLayout><LoginPage /></MainLayout>,
  },
  {
    path: '/auth/signup',
    element: <MainLayout><SignupPage /></MainLayout>,
  },
  {
    path: '/profile',
    element: <MainLayout><ProfilePage /></MainLayout>,
  },
])

