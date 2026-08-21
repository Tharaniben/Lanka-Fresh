import { useState, type FormEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth, useSignIn } from "@clerk/react";

function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: async ({ session }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }
          navigate("/");
        },
      });
    } else {
      // Multi-factor auth and device trust aren't set up in this app yet —
      // if you enable them in the Clerk Dashboard later, handle those
      // signIn.status values here.
      console.error("Sign-in attempt not complete:", signIn);
    }
  }

  return (
    <div className="auth-page">
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
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
        />
        {errors.fields.password && (
          <p className="field-error">{errors.fields.password.message}</p>
        )}

        <button type="submit" disabled={fetchStatus === "fetching"}>
          Sign in
        </button>
      </form>

      <p>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
      <p>
        Don't have an account? <Link to="/sign-up">Sign up</Link>
      </p>
    </div>
  );
}

export default SignInPage;
