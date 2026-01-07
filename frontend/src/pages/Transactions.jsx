import { useEffect, useState } from "react";
import "./Transactions.css";

function Transactions() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/payments", {
      headers: {
        "X-Api-Key": "key_test_abc123",
        "X-Api-Secret": "secret_test_xyz789"
      }
    })
      .then(res => res.json())
      .then(data => setPayments(data));
  }, []);

  return (
    <table data-test-id="transactions-table">
      <thead>
        <tr>
          <th>Payment ID</th>
          <th>Order ID</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>

      <tbody>
        {payments.map(p => (
          <tr
            key={p.id}
            data-test-id="transaction-row"
            data-payment-id={p.id}
          >
            <td data-test-id="payment-id">{p.id}</td>
            <td data-test-id="order-id">{p.order_id}</td>
            <td data-test-id="amount">{p.amount}</td>
            <td data-test-id="method">{p.method}</td>
            <td data-test-id="status">{p.status}</td>
            <td data-test-id="created-at">{p.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Transactions;
