import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import PageLoader from "./components/Pageloader";
import ProtectedRoute from "./components/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PersediaanPage = lazy(() => import("./pages/PersediaanPage"));
const PesananPage = lazy(() => import("./pages/PesananPage"));
const LaporanPage = lazy(() => import("./pages/LaporanPage"));
const RestoranPage = lazy(() => import("./pages/RestoranPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
          </Route>

          <Route
            path="/manager/*"
            element={<Navigate to="/pemilik/dashboard" replace />}
          />
          <Route
            path="/staff/*"
            element={<Navigate to="/karyawan/dashboard" replace />}
          />

          <Route element={<ProtectedRoute allowedRoles={["pemilik"]} />}>
            <Route path="/pemilik" element={<MainLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="persediaan" element={<PersediaanPage />} />
              <Route path="restoran" element={<RestoranPage />} />
              <Route path="pengguna" element={<UsersPage />} />
              <Route path="laporan" element={<LaporanPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["karyawan"]} />}>
            <Route path="/karyawan" element={<MainLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="persediaan" element={<PersediaanPage />} />
              <Route path="restoran" element={<RestoranPage />} />
              <Route path="pesanan" element={<PesananPage />} />
              <Route path="laporan" element={<LaporanPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
