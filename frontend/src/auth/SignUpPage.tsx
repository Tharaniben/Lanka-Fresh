import { SignUp } from "@clerk/react";

function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}

export default SignUpPage;
