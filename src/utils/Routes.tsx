import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import StaffProductScreen from "../screens/StaffProductScreen";
import StaffProductDetailScreen from "../screens/StaffProductDetailScreen";
import StaffOrderConfirmScreen from "../screens/StaffOrderConfirmScreen";
import StaffCartScreen from "../screens/StaffCartScreen";
import StaffOrderPaymentScreen from "../screens/StaffOrderPaymentScreen";
import Home from "../screens/home"
import LoginScreen from "../screens/LoginScreen";
import ManagerOrderListScreen from "../screens/ManagerOrderListScreen";
import AdminCategoryScreen from "../screens/AdminCategoryScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import ManagerIncomeScreen from "../screens/ManagerIncomeScreen";

const Layout = lazy(() => import("../components/MainLayout"));
const ProtectedRoute = lazy(() => import("../utils/ProtectedRoutes"));
const AdminLayout = lazy(() => import("../components/AdminLayout")); 



export const AppRoutes = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/staff/products",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["STAFF"]}>
                    <StaffProductScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/products/:id",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["STAFF"]}>
                    <StaffProductDetailScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/orders/confirm",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["STAFF"]}>
                    <StaffOrderConfirmScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/cart",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["STAFF"]}>
                    <StaffCartScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/payment",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["STAFF"]}>
                    <StaffOrderPaymentScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/manager/orderList",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["GUEST"]}>
                    <ManagerOrderListScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/manager/manageIncome",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["GUEST"]}>
                    <ManagerIncomeScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/admin/categories",
        element: (
            <AdminLayout>
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminCategoryScreen />
                </ProtectedRoute>
            </AdminLayout>
        ),
    },
    {
        path: "/admin/dashboard",
        element: (
            <AdminLayout>
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboardScreen />
                </ProtectedRoute>
            </AdminLayout>
        ),
    },
    {
        path: "/login",
        element: <LoginScreen />,
      }
])