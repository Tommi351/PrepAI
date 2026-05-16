import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { login } from "../../services/auth";
import Spinner from "../dashboard/Spinner";
import { FaSignInAlt } from "react-icons/fa";

const LoginForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await login(email, password);

      if (!session?.access_token) {
        setError("Invalid login or email not verified.");
        return;
      }

      localStorage.setItem("token", session.access_token);
      navigate("/dashboard");

      // Clear inputs after success
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        toast.error(err.message) ||
          "Login failed, password or username is incorrect",
      );
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
          <FaSignInAlt /> Login
        </h1>
        <p>Login to PrepAI and start preperation for exams</p>
      </section>

      <section className="form">
        <form onSubmit={handleLogin}>
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
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-block  disabled={loading}">
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>

          {error && <p>{error}</p>}
        </form>
      </section>
    </>
  );
};

export default LoginForm;
