import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole, hasPermission } from "../utils/permissions";

export default function ProtectedRoute({ children, permission }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    const role = getUserRole();
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center border border-[#e5e7eb]">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 mb-2">
            Your role (<span className="font-semibold capitalize text-[#6B21A8]">{role}</span>) does not have permission to access this page.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Please contact your administrator.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-[#6B21A8] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#581c87] transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}