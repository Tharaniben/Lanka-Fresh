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

  if (isSignedIn) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { error } = await signUp.create({ username, emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: async () => { navigate("/"); },
      });
    }
  }

  return (
    <div className="auth-page">
      <h1>Create your account</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {errors.fields.username && (
          <p className="field-error">{errors.fields.username.message}</p>
        )}

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          required
        />
        {errors.fields.emailAddress && (
          <p className="field-error">{errors.fields.emailAddress.message}</p>
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
          {fetchStatus === "fetching" ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p>Already have an account? <Link to="/sign-in">Sign in</Link></p>
    </div>
  );
}

export default SignUpPage;
