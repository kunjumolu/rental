import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import useWindowSize from "../hooks/useWindowSize";

export default function DashboardHeader() {
  const { isSm, isMd, isLg } = useWindowSize();

  return (
    <header
      style={{
        height: isSm ? "60px" : "52px",
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isSm ? "0 28px" : "0 12px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: isSm ? "14px" : "12px",
          minWidth: 0,
        }}
      >
        <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>
          Nexus ERP
        </span>
        <span style={{ color: "#d1d5db" }}>›</span>
        <span
          style={{
            color: "#111827",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Dashboard
        </span>
      </div>

      {/* Right controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isSm ? "16px" : "10px",
        }}
      >
        {/* Search — hidden below md on very small screens */}
        {isMd && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "6px 12px",
              width: isLg ? "220px" : "160px",
            }}
          >
            <Search size={14} color="#9ca3af" />
            <input
              placeholder="Search anything..."
              style={{
                border: "none",
                background: "none",
                outline: "none",
                fontSize: "13px",
                color: "#6b7280",
                width: "100%",
              }}
            />
          </div>
        )}

        {/* Mobile search icon */}
        {!isMd && (
          <div style={{ cursor: "pointer", display: "flex" }}>
            <Search size={20} color="#6b7280" />
          </div>
        )}

        {/* Bell */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={isSm ? 20 : 18} color="#6b7280" />
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "10px",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            5
          </span>
        </div>

        {isSm && (
          <HelpCircle
            size={20}
            color="#6b7280"
            style={{ cursor: "pointer" }}
          />
        )}

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: isSm ? "34px" : "30px",
              height: isSm ? "34px" : "30px",
              borderRadius: "8px",
              background: "#374151",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isSm ? "12px" : "11px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            AD
          </div>
          {isSm && (
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                Alex Director
              </div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Admin</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
