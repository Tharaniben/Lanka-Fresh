import { SignUp, useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";

function SignUpPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Navigate to="/" replace />;

  return (
    <div className="auth-container">
      <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "1rem" }}>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}

export default SignUpPage;

