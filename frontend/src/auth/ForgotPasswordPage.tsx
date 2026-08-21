import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn } from "@clerk/react";

function ForgotPasswordPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // Step 1: start a sign-in attempt for this email, then email a reset code
  async function sendCode(e: FormEvent) {
    e.preventDefault();
    const { error: createError } = await signIn.create({ identifier: emailAddress });
    if (createError) {
      console.error(JSON.stringify(createError, null, 2));
      return;
    }
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      console.error(JSON.stringify(sendError, null, 2));
      return;
    }
    setCodeSent(true);
  }

  // Step 2: verify the code they were emailed
  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  }

  // Step 3: set the new password, then finish signing them in
  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
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
      console.error("Sign-in attempt not complete:", signIn);
    }
  }

  // Step 3 UI takes priority once Clerk says a new password is needed
  if (signIn.status === "needs_new_password") {
    return (
      <div className="auth-page">
        <h1>Set a new password</h1>
        <form onSubmit={submitNewPassword}>
          <label htmlFor="password">New password</label>
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
            Set new password
          </button>
        </form>
      </div>
    );
  }

  // Step 2 UI: enter the code, once it's been sent
  if (codeSent) {
    return (
      <div className="auth-page">
        <h1>Check your email</h1>
        <form onSubmit={verifyCode}>
          <label htmlFor="code">Enter the reset code we emailed you</label>
          <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} />
          {errors.fields.code && <p className="field-error">{errors.fields.code.message}</p>}
          <button type="submit" disabled={fetchStatus === "fetching"}>
            Verify code
          </button>
        </form>
      </div>
    );
  }

  // Step 1 UI: ask for the email address
  return (
    <div className="auth-page">
      <h1>Forgot your password?</h1>
      <form onSubmit={sendCode}>
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
        <button type="submit" disabled={fetchStatus === "fetching"}>
          Send reset code
        </button>
      </form>
      <p>
        Remembered it? <Link to="/sign-in">Sign in</Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
