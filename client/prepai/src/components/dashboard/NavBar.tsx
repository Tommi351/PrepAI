import { useState } from "react";
import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate, Link } from "react-router";
import { logout } from "../../services/auth";
import Spinner from "./Spinner";

function NavBar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSignOut(e) {
    setLoading(true);

    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError(`Failed to log out user: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <header className="header">
      <div className="logo">
        <Link to="/dashboard" className="btn">
          PrepAI
        </Link>
      </div>
      <ul>
        {error ? (
          <li>
            <button className="btn btn-block" onClick={handleSignOut}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login">
                <FaSignInAlt /> Login
              </Link>
            </li>
            <li>
              <Link to="/login">
                <FaUser /> Register
              </Link>
            </li>
          </>
        )}

        <li>
          <Link to="/files">Files</Link>
        </li>

        <li>
          <Link to="/chat">Chat</Link>
        </li>
      </ul>
      <button className="btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </header>
  );
}

export default NavBar;
