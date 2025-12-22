import { Link, useLocation } from "react-router";
import { useUserAuthStore } from "../store/useUserAuth";
import { useState } from "react";
import { IoIosMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  console.log(isOpen);

  const { isUserLoggedIn, userData } = useUserAuthStore();
  const logoutUser = useUserAuthStore((state) => state.logoutUser);
  const location = useLocation();
  return (
    <>
      <div className="top-0 w-full font-medium border-b">
        <div className="flex items-center justify-between px-5 py-4">
          {/* left */}
          <div>
            <Link
              to={""}
              className={`text-xl ${isOpen ? "text-white" : "text-black"}`}
            >
              Ticket One
            </Link>
          </div>
          {/* mid */}
          <div className="hidden items-center gap-5 md:flex">
            <Link to={"/events"}>Explore Events</Link>
            {/* <Link to={""}>About Us</Link> */}
            {isUserLoggedIn ? (
              <Link to={""}>Notifications</Link>
            ) : (
              <Link to={"/organization/signup"}>Host an Event</Link>
            )}
            <Link to={""}>Support</Link>
          </div>
          {/* right */}
          <div>
            <div className="hidden md:flex">
              {isUserLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link to={`/user/profile/${userData.id}`} className="">
                    My Account
                  </Link>
                  <button
                    onClick={logoutUser}
                    className="border-black cursor-pointer border px-2 py-1"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to={`/user/login?redirect=${location.pathname}`}
                    className="border-black border px-2 py-1"
                  >
                    Login
                  </Link>
                  <Link
                    to={"/user/signup"}
                    className="bg-black text-white px-2 py-1"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
            <div className="flex md:hidden">
              <div className="text-2xl" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <RxCross2 /> : <IoIosMenu />}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-orange-600 font-medium text-white z-40 md:hidden pt-16 px-5"
          >
            <nav className="flex flex-col gap-6 text-lg">
              <Link to="/events" onClick={() => setIsOpen(false)}>
                Explore Events
              </Link>

              <Link to="" onClick={() => setIsOpen(false)}>
                {isUserLoggedIn ? "Notifications" : "Host an Event"}
              </Link>

              <Link to="" onClick={() => setIsOpen(false)}>
                Support
              </Link>

              {isUserLoggedIn ? (
                <>
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsOpen(false);
                    }}
                    className="text-left border px-5 py-1 border-white w-fit"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={`/user/login?redirect=${location.pathname}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link to="/user/signup" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
