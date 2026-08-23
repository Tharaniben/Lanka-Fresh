import { SignIn } from "@clerk/react";

function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}

export default SignInPage;
