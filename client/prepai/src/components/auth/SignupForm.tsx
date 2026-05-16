import { useState } from "react";
import { useNavigate } from "react-router";
import { signup } from "../../services/auth";
import Spinner from "../dashboard/Spinner";
import { FaUser } from "react-icons/fa";

const SignupForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(error.message || "Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await signup(email, password);

      if (result?.session?.access_token) {
        localStorage.setItem("token", result.session.access_token);
        navigate("/dashboard");
      } else {
        setError(
          "Check your email to activate your account before logging in.",
        );
      }

      // Clear inputs after success
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <section className="heading">
        <h1>
          <FaUser /> Register
        </h1>
        <p>Create your PrepAI account</p>
      </section>

      <section className="form">
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              id="confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              placeholder="Confirm your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-block" disabled={loading}>
              {loading ? "Signing You Up..." : "Create Account"}
            </button>
          </div>

          {error && <p>{error}</p>}
        </form>
      </section>
    </>
  );
};

export default SignupForm;
