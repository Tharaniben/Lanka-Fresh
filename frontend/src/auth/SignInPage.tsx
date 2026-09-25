import { SignIn, useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";

function SignInPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Navigate to="/" replace />;

  return (
    <div className="auth-container">
      <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "1rem" }}>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}

export default SignInPage;

