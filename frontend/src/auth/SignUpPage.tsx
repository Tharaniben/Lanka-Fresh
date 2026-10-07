import { useState, type FormEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth, useSignUp } from "@clerk/react";

function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  if (isSignedIn) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setCustomError(null);

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    const { error } = await signUp.create({ username, emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setCustomError(error.message || "Failed to create account. Please check your details.");
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: async () => {
          navigate("/");
        },
      });
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand-icon">🌿</span>
            <span className="auth-brand-name">LankaFresh</span>
          </div>
          <h1>Create your account</h1>
          <p>Join LankaFresh to start shopping</p>
        </div>

        {customError && <div className="auth-alert-error">{customError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            {errors.fields.username && (
              <p className="field-error">{errors.fields.username.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
            {errors.fields.emailAddress && (
              <p className="field-error">{errors.fields.emailAddress.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmPassword && e.target.value !== confirmPassword) {
                  setPasswordError("Passwords do not match");
                } else {
                  setPasswordError(null);
                }
              }}
              required
            />
            {errors.fields.password && (
              <p className="field-error">{errors.fields.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (password && e.target.value !== password) {
                  setPasswordError("Passwords do not match");
                } else {
                  setPasswordError(null);
                }
              }}
              required
            />
            {passwordError && <p className="field-error">{passwordError}</p>}
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching" ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>{" "}
          <Link to="/sign-in" className="auth-inline-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
