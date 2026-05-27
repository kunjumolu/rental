import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Globe, User } from "lucide-react";
import CompanySettings from "../components/settings/CompanySettings";
import SystemSettings from "../components/settings/SystemSettings";
import UserProfileSettings from "../components/settings/UserProfileSettings";
import "./Settings.css";

const TABS = [
  { key: "company", label: "Company",      icon: Building2 },
  { key: "system",  label: "System",       icon: Globe },
  { key: "profile", label: "User Profile", icon: User },
];

const VALID_TABS = TABS.map((t) => t.key);

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(
    VALID_TABS.includes(tabParam) ? tabParam : "company"
  );

  // Sync tab if URL param changes (e.g. navigating via Topbar link or browser back/forward)
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Configure your system preferences and business details</p>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`settings-tab${activeTab === key ? " active" : ""}`}
            onClick={() => handleTabChange(key)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {activeTab === "company" && <CompanySettings />}
        {activeTab === "system"  && <SystemSettings />}
        {activeTab === "profile" && <UserProfileSettings />}
      </div>
    </div>
  );
}
