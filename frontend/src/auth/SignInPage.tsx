import { useState, type FormEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth, useSignIn } from "@clerk/react";

function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // identifier accepts either username or email
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  if (isSignedIn) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { error } = await signIn.password({ identifier, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: async () => { navigate("/"); },
      });
    }
  }

  return (
    <div className="auth-page">
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="identifier">Username or email</label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        {errors.fields.identifier && (
          <p className="field-error">{errors.fields.identifier.message}</p>
        )}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errors.fields.password && (
          <p className="field-error">{errors.fields.password.message}</p>
        )}

        <button type="submit" disabled={fetchStatus === "fetching"}>
          {fetchStatus === "fetching" ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p><Link to="/forgot-password">Forgot your password?</Link></p>
      <p>Don't have an account? <Link to="/sign-up">Sign up</Link></p>
    </div>
  );
}

export default SignInPage;
