import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "test@example.com") {
      navigate("/dashboard");
    } else {
      alert("Invalid email. Use test@example.com");
    }
  };

  return (
    <div className="login-container">
      <form
        data-test-id="login-form"
        className="login-form"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <h2 className="login-title">Merchant Login</h2>

        <input
          data-test-id="email-input"
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />

        <input
          data-test-id="password-input"
          className="login-input"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
        />

        <button
          data-test-id="login-button"
          className="login-button"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
