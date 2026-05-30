// import { Search, Bell, HelpCircle } from "lucide-react";

// export default function AccountingHeader() {
//   return (
//     <header
//       style={{
//         height: "60px",
//         background: "#fff",
//         borderBottom: "1px solid #e5e7eb",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         padding: "0 28px",
//         position: "sticky",
//         top: 0,
//         zIndex: 10,
//       }}
//     >
//       {/* Breadcrumb */}
//       <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
//         <span style={{ color: "#6b7280" }}>Nexus ERP</span>
//         <span style={{ color: "#d1d5db" }}>›</span>
//         <span style={{ color: "#111827", fontWeight: 500 }}>Accounting</span>
//       </div>

//       {/* Right controls */}
//       <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
//         {/* Search */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             background: "#f9fafb",
//             border: "1px solid #e5e7eb",
//             borderRadius: "8px",
//             padding: "6px 12px",
//             width: "220px",
//           }}
//         >
//           <Search size={14} color="#9ca3af" />
//           <input
//             placeholder="Search anything..."
//             style={{
//               border: "none",
//               background: "none",
//               outline: "none",
//               fontSize: "13px",
//               color: "#6b7280",
//               width: "100%",
//             }}
//           />
//         </div>

//         {/* Bell */}
//         <div style={{ position: "relative", cursor: "pointer" }}>
//           <Bell size={20} color="#6b7280" />
//           <span
//             style={{
//               position: "absolute",
//               top: "-4px",
//               right: "-4px",
//               background: "#3b82f6",
//               color: "#fff",
//               borderRadius: "50%",
//               fontSize: "10px",
//               width: "16px",
//               height: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontWeight: 700,
//             }}
//           >
//             5
//           </span>
//         </div>

//         <HelpCircle size={20} color="#6b7280" style={{ cursor: "pointer" }} />

//         {/* Avatar */}
//         <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//           <div
//             style={{
//               width: "34px",
//               height: "34px",
//               borderRadius: "8px",
//               background: "#374151",
//               color: "#fff",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "12px",
//               fontWeight: 700,
//             }}
//           >
//             AD
//           </div>
//           <div>
//             <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
//               Alex Director
//             </div>
//             <div style={{ fontSize: "11px", color: "#9ca3af" }}>Admin</div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
