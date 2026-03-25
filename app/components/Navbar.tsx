import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth } = usePuterStore();

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">KHARIAR</p>
      </Link>
      <div className="flex-center gap-4">
        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>
        {auth.isAuthenticated && (
          <button
            className="cursor-pointer hover:text-gradient"
            onClick={auth.signOut}
          >
            <p>Log Out</p>
          </button>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
