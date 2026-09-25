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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("email");

  // Step 1 — send reset code to email
  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setCustomError(null);
    const { error: createError } = await signIn.create({ identifier: emailAddress });
    if (createError) {
      console.error(createError);
      setCustomError(createError.message || "Unable to send reset code. Please check the email address.");
      return;
    }
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      console.error(sendError);
      setCustomError(sendError.message || "Failed to deliver reset code.");
      return;
    }
    setStep("code");
  }

  // Step 2 — verify the code
  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setCustomError(null);
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      console.error(error);
      setCustomError(error.message || "Invalid verification code. Please check and try again.");
      return;
    }
    if (signIn.status === "needs_new_password") setStep("password");
  }

  // Step 3 — set new password and confirm
  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setCustomError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    if (error) {
      console.error(error);
      setCustomError(error.message || "Failed to reset password.");
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

  if (step === "password") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-brand">
              <span className="auth-brand-icon">🌿</span>
              <span className="auth-brand-name">LankaFresh</span>
            </div>
            <h1>Set a new password</h1>
            <p>Please enter and confirm your new password</p>
          </div>

          {customError && <div className="auth-alert-error">{customError}</div>}

          <form onSubmit={submitNewPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (confirmPassword && e.target.value !== confirmPassword) {
                    setPasswordError("Passwords do not match");
                  } else {
                    setPasswordError(null);
                  }
                }}
                required
                autoFocus
              />
              {errors.fields.password && (
                <p className="field-error">{errors.fields.password.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (newPassword && e.target.value !== newPassword) {
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
              {fetchStatus === "fetching" ? "Saving..." : "Set New Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-brand">
              <span className="auth-brand-icon">🌿</span>
              <span className="auth-brand-name">LankaFresh</span>
            </div>
            <h1>Check your email</h1>
            <p>
              We sent a verification code to <strong>{emailAddress}</strong>
            </p>
          </div>

          {customError && <div className="auth-alert-error">{customError}</div>}

          <form onSubmit={verifyCode} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">Verification code</label>
              <input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
              />
              {errors.fields.code && (
                <p className="field-error">{errors.fields.code.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={fetchStatus === "fetching"}
            >
              {fetchStatus === "fetching" ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="auth-footer">
            <button
              type="button"
              className="auth-link-button"
              onClick={() => setStep("email")}
            >
              ← Back to change email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand-icon">🌿</span>
            <span className="auth-brand-name">LankaFresh</span>
          </div>
          <h1>Forgot your password?</h1>
          <p>Enter your email address and we'll send you a reset code.</p>
        </div>

        {customError && <div className="auth-alert-error">{customError}</div>}

        <form onSubmit={sendCode} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
              autoFocus
            />
            {errors.fields.identifier && (
              <p className="field-error">{errors.fields.identifier.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching" ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Remembered it?</span>{" "}
          <Link to="/sign-in" className="auth-inline-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
