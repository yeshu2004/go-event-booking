import { Link, useLocation } from "react-router";
import { useUserAuthStore } from "../store/useUserAuth";

function Navbar() {
  const { isUserLoggedIn } = useUserAuthStore();
  const logoutUser = useUserAuthStore((state) => state.logoutUser);
   const location = useLocation() 
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-5 py-2">
        {/* left */}
        <div>
          <Link to={""} className="text-xl">Ticket One</Link>
        </div>
        {/* mid */}
        <div className="hidden items-center gap-5 md:flex">
          <Link to={""}>Home</Link>
          <Link to={""}>Explore Events</Link>
          <Link to={""}>
            {isUserLoggedIn ? "Notifications" : "Host an Event"}
          </Link>
          <Link to={""}>Support</Link>
        </div>
        {/* right */}
        {isUserLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link to={"/"} className="">
              My Account
            </Link>
            <button onClick={logoutUser} className="border-black cursor-pointer border px-2 py-1">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to={`/user/login?redirect=${location.pathname}`} className="border-black border px-2 py-1">
              Login
            </Link>
            <Link to={"/user/signup"} className="bg-black text-white px-2 py-1">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
