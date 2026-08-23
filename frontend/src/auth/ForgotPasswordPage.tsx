import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn } from "@clerk/react";

type Step = "email" | "code" | "password";

function ForgotPasswordPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<Step>("email");

  // Step 1 — send reset code to email
  async function sendCode(e: FormEvent) {
    e.preventDefault();
    const { error: createError } = await signIn.create({ identifier: emailAddress });
    if (createError) { console.error(createError); return; }
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) { console.error(sendError); return; }
    setStep("code");
  }

  // Step 2 — verify the code
  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) { console.error(error); return; }
    if (signIn.status === "needs_new_password") setStep("password");
  }

  // Step 3 — set new password and sign in
  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    if (error) { console.error(error); return; }
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: async () => { navigate("/"); } });
    }
  }

  if (step === "password") {
    return (
      <div className="auth-page">
        <h1>Set a new password</h1>
        <form onSubmit={submitNewPassword}>
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />
          {errors.fields.password && (
            <p className="field-error">{errors.fields.password.message}</p>
          )}
          <button type="submit" disabled={fetchStatus === "fetching"}>
            {fetchStatus === "fetching" ? "Saving..." : "Set new password"}
          </button>
        </form>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="auth-page">
        <h1>Check your email</h1>
        <p>We sent a reset code to <strong>{emailAddress}</strong></p>
        <form onSubmit={verifyCode}>
          <label htmlFor="code">Reset code</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
          />
          {errors.fields.code && (
            <p className="field-error">{errors.fields.code.message}</p>
          )}
          <button type="submit" disabled={fetchStatus === "fetching"}>
            {fetchStatus === "fetching" ? "Verifying..." : "Verify code"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h1>Forgot your password?</h1>
      <p>Enter your email address and we'll send you a reset code.</p>
      <form onSubmit={sendCode}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          required
        />
        {errors.fields.identifier && (
          <p className="field-error">{errors.fields.identifier.message}</p>
        )}
        <button type="submit" disabled={fetchStatus === "fetching"}>
          {fetchStatus === "fetching" ? "Sending..." : "Send reset code"}
        </button>
      </form>
      <p>Remembered it? <Link to="/sign-in">Sign in</Link></p>
    </div>
  );
}

export default ForgotPasswordPage;
