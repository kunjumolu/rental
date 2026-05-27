import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
// import AccountingOverview from "../components/accounting/AccountingOverview";
import FinancialSummaryCards from "../components/accounting/FinancialSummaryCards";
import AccountingTabs from "../components/accounting/AccountingTabs";
import GeneralLedger from "../components/accounting/GeneralLedger";
import AccountsPayable from "../components/accounting/AccountsPayable";
import AccountsReceivable from "../components/accounting/AccountsReceivable";
import ChartOfAccounts from "../components/accounting/ChartOfAccounts";
import TaxRates from "../components/accounting/TaxRates";

const tabComponents = {
  "General Ledger": <GeneralLedger />,
  "Accounts Payable": <AccountsPayable />,
  "Accounts Receivable": <AccountsReceivable />,
  "Chart of Accounts": <ChartOfAccounts />,
  "Tax Rates": <TaxRates />,
};

export default function AccountingPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("General Ledger");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <main style={{ padding: "28px 28px 40px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Accounting &amp; Financials
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Complete financial management, reporting, and compliance
          </p>
        </div>

        {/* Accounting Overview with filter */}
        {/* <AccountingOverview /> */}

        {/* Financial Summary Cards */}
        <FinancialSummaryCards />

        {/* Tabs */}
        <AccountingTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {tabComponents[activeTab]}
      </main>
    </div>
  );
}