import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="flex items-center gap-6">
            <h1
              className="logo cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              Online Shop
            </h1>
            <nav className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/products")}
                className={`nav-link ${isActive("/products") ? "active" : ""}`}
              >
                Products
              </button>
              <button
                onClick={() => navigate("/orders")}
                className={`nav-link ${isActive("/orders") && !isActive("/admin/orders") ? "active" : ""}`}
              >
                My Orders
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin/orders")}
                  className={`nav-link ${isActive("/admin/orders") ? "active" : ""}`}
                >
                  Manage Orders
                </button>
              )}
            </nav>
          </div>
          {user && (
            <div className="user-info">
              <span className="user-name">
                {user.firstName} {user.lastName}
              </span>
              {(isAdmin || user.role === "vendor") && (
                <span className="text-xs text-blue-600 font-medium ml-2">
                  {user.role.toUpperCase()}
                </span>
              )}
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
};
