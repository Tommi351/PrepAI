import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

const AuthPage = () => {
  const [authMode, setAuthMode] = useState("login");

  return (
    <section className="auth-container">
      <div className="auth-box">
        {authMode === "login" ? <LoginForm /> : <SignupForm />}

        <div>
          {/* Conditional label text */}
          <p>
            {authMode === "login" ? "New here?" : "Already have an account?"}
          </p>
          <button
            className="btn btn-block"
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
          >
            {authMode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>

      <footer>
        <p>© 2026 PrepAI. All rights reserved.</p>
        <nav>
          <a href="/privacy">Privacy Policy</a>
          <br />
          <a href="/terms">Terms of Service</a>
        </nav>
      </footer>
    </section>
  );
};

export default AuthPage;
