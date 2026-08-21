import { useState, type FormEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth, useSignUp } from "@clerk/react";

function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Step 1: collect email + password
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    await signUp.verifications.sendEmailCode();
  }

  // Step 2: verify the emailed code, then activate the session
  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: async ({ session }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }
          navigate("/");
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  }

  const awaitingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (awaitingVerification) {
    return (
      <div className="auth-page">
        <h1>Verify your email</h1>
        <form onSubmit={handleVerify}>
          <label htmlFor="code">Enter the code we emailed you</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {errors.fields.code && <p className="field-error">{errors.fields.code.message}</p>}
          <button type="submit" disabled={fetchStatus === "fetching"}>
            Verify
          </button>
        </form>
        <button
          type="button"
          className="link-button"
          onClick={() => signUp.verifications.sendEmailCode()}
        >
          Resend code
        </button>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h1>Create your account</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
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
        />
        {errors.fields.password && (
          <p className="field-error">{errors.fields.password.message}</p>
        )}

        <button type="submit" disabled={fetchStatus === "fetching"}>
          Sign up
        </button>
      </form>

      {/* Required by Clerk's bot sign-up protection */}
      <div id="clerk-captcha" />

      <p>
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </p>
    </div>
  );
}

export default SignUpPage;
