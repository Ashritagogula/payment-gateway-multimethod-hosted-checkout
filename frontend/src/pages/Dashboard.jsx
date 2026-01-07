import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetch("/api/v1/dashboard/stats", {
      headers: {
        "X-Api-Key": "key_test_abc123",
        "X-Api-Secret": "secret_test_xyz789",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalTransactions: data.total_transactions,
          totalAmount: data.total_amount,
          successRate: data.success_rate,
        });
      })
      .catch((err) => console.error("Dashboard stats error:", err));
  }, []);

  return (
    <div data-test-id="dashboard" className="dashboard">
      <h1 className="dashboard-title">Merchant Dashboard</h1>

      <div data-test-id="api-credentials" className="credentials">
        <div className="credential-card">
          <label>API Key</label>
          <span data-test-id="api-key" className="credential-value">
            key_test_abc123
          </span>
        </div>

        <div className="credential-card">
          <label>API Secret</label>
          <span data-test-id="api-secret" className="credential-value">
            secret_test_xyz789
          </span>
        </div>
      </div>

      <div data-test-id="stats-container" className="stats">
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div data-test-id="total-transactions" className="stat-value">
            {stats.totalTransactions}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Amount</div>
          <div data-test-id="total-amount" className="stat-value">
            ₹{stats.totalAmount}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Success Rate</div>
          <div data-test-id="success-rate" className="stat-value">
            {stats.successRate}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
