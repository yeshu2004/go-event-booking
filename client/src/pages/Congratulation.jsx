import { Link, useNavigate } from "react-router";
import { GiGlassCelebration } from "react-icons/gi";
import { IoMailUnreadOutline } from "react-icons/io5";
import { useUserAuthStore } from "../store/useUserAuth";
import { useEffect } from "react";

function Congratulations() {
  const navigate = useNavigate();
  const { userData, isUserLoggedIn } = useUserAuthStore();
  let usernName = userData?.full_name.split(" ")[0];
  console.log(userData);

  useEffect(() => {
    if (!isUserLoggedIn) navigate("/user/login", { replace: true });
  }, [isUserLoggedIn, navigate]);

  if (!isUserLoggedIn) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="bg-white p-8 text-center items-center">
          <h1 className="text-2xl text-gray-900 mb-2">
            Please Login to view this page.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="bg-white p-8 text-center items-center">
        {/* Emoji / Icon */}
        <div className="text-8xl mb-4 flex items-center justify-center">
          <GiGlassCelebration />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>

        {/* Success message */}
        <p className="text-gray-600 mb-4">
          Hi {usernName}, your booking was successful. We’re excited to have you
          with us!
        </p>

        <div className="h-px w-24 bg-gray-200 mx-auto my-6" />

        {/* Email confirmation */}
        <div className="bg-indigo-50 w-fit flex md:flex-row text-center items-center justify-center border border-indigo-200 rounded-lg p-4 text-sm text-indigo-700 mb-6 flex-col">
          <span className="pr-1">
            <IoMailUnreadOutline />
          </span>
          <span className="font-semibold pr-1">PDF bill</span> and booking
          details have been sent to your registered email address.
        </div>

        {/* Extra info */}
        <p className="text-xs text-gray-500 mb-6">
          Didn’t receive the email? Please check your spam folder or contact
          support.
        </p>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            to="/events"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Explore More Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Congratulations;
