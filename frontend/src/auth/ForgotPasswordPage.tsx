import { SignIn } from "@clerk/react";

// Clerk's SignIn component includes forgot password flow built-in.
// This page exists as a fallback route but Clerk handles the flow
// automatically from within the SignIn component.
function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}

export default ForgotPasswordPage;
