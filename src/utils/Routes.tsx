import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import StaffProductScreen from "../screens/StaffProductScreen";
import StaffProductDetailScreen from "../screens/StaffProductDetailScreen";
import StaffOrderConfirmScreen from "../screens/StaffOrderConfirmScreen";
import StaffCartScreen from "../screens/StaffCartScreen";
import StaffOrderPaymentScreen from "../screens/StaffOrderPaymentScreen";
import Home from "../screens/home"
import LoginScreen from "../screens/LoginScreen";

const Layout = lazy(() => import("../components/MainLayout"));
const ProtectedRoute = lazy(() => import("../utils/ProtectedRoutes"));


export const AppRoutes = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/staff/products",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["GUEST"]}>
                    <StaffProductScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/products/:id",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["GUEST"]}>
                    <StaffProductDetailScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/orders/confirm",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["GUEST"]}>
                    <StaffOrderConfirmScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/cart",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["GUEST"]}>
                    <StaffCartScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/staff/payment",
        element: (
            <Layout>
                <ProtectedRoute allowedRoles={["GUEST"]}>
                    <StaffOrderPaymentScreen />
                </ProtectedRoute>
            </Layout>
        ),
    },
    {
        path: "/login",
        element: <LoginScreen />,
      }
])