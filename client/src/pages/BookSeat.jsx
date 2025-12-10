import { Link } from "react-router";
import { useUserAuthStore } from "../store/useUserAuth"

function BookSeat() {
    const {isUserLoggedIn } = useUserAuthStore();

    if (!isUserLoggedIn) return <div className="p-5 text-center w-full">oops user, please login to Book ticket...<Link to={"/user/login"} className="text-blue-600">login</Link></div>;

  return (
    <div>BookSeat</div>
  )
}

export default BookSeat