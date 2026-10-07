import { useState, type FormEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth, useSignIn } from "@clerk/react";

function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  if (isSignedIn) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCustomError(null);
    const { error } = await signIn.password({ identifier, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setCustomError(error.message || "Invalid credentials. Please check your username/email and password.");
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize({
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
          <h1>Welcome Back</h1>
          <p>Sign in to your supermarket account</p>
        </div>

        {customError && <div className="auth-alert-error">{customError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">Username or email</label>
            <input
              id="identifier"
              type="text"
              placeholder="name@example.com or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />
            {errors.fields.identifier && (
              <p className="field-error">{errors.fields.identifier.message}</p>
            )}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-helper-link">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.fields.password && (
              <p className="field-error">{errors.fields.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching" ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>{" "}
          <Link to="/sign-up" className="auth-inline-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
