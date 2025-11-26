import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authService } from "@/services/auth.service";
import "./Auth.css";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Invalid or missing verification token");
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setMessage(response.message || "Email verified successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to verify email. The token may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>

        {loading && (
          <div className="info-message">
            <p>Verifying your email...</p>
          </div>
        )}

        {error && (
          <>
            <div className="error-message">{error}</div>
            <div className="auth-links">
              <Link to="/login">Go to Login</Link>
            </div>
          </>
        )}

        {message && (
          <>
            <div className="success-message">{message}</div>
            <p className="auth-description">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
};
