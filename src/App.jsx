import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import PageLoader from "./components/PageLoader";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PersediaanPage = lazy(() => import("./pages/PersediaanPage"));
const PesananPage = lazy(() => import("./pages/PesananPage"));
const LaporanPage = lazy(() => import("./pages/LaporanPage"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root redirect ke login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
          </Route>

          {/* Manager */}
          <Route path="/manager" element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="persediaan" element={<PersediaanPage />} />
            <Route path="pesanan" element={<PesananPage />} />
            <Route path="laporan" element={<LaporanPage />} />
          </Route>

          {/* Staff */}
          <Route path="/staff" element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="persediaan" element={<PersediaanPage />} />
            <Route path="pesanan" element={<PesananPage />} />
            <Route path="laporan" element={<LaporanPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
