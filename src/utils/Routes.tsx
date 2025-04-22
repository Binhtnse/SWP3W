import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import StaffProductScreen from "../screens/StaffProductScreen";
import StaffProductDetailScreen from "../screens/StaffProductDetailScreen";
import StaffOrderConfirmScreen from "../screens/StaffOrderConfirmScreen";
import StaffCartScreen from "../screens/StaffCartScreen";
import StaffOrderPaymentScreen from "../screens/StaffOrderPaymentScreen";
import LoginScreen from "../screens/LoginScreen";
import ManagerOrderListScreen from "../screens/ManagerOrderListScreen";
import AdminCategoryScreen from "../screens/AdminCategoryScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import ManagerIncomeScreen from "../screens/ManagerIncomeScreen";
import AdminAccountListScreen from "../screens/AdminAccountListScreen";
import ManagerProductList from "../screens/ManagerProductList";

const Layout = lazy(() => import("../components/MainLayout"));
const ProtectedRoute = lazy(() => import("../utils/ProtectedRoutes"));
const AdminLayout = lazy(() => import("../components/AdminLayout")); 



export const AppRoutes = createBrowserRouter([
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
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                    <ManagerOrderListScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/manager/manageIncome",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                    <ManagerIncomeScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/manager/listProduct",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                    <ManagerProductList />
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
        path: "/admin/accounts",
        element: (
            <AdminLayout>
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminAccountListScreen />
                </ProtectedRoute>
            </AdminLayout>
        ),
    },
    {
        path: "/",
        element: <LoginScreen />,
      }
])