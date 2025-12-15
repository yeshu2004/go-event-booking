import { Link } from "react-router";
import { useUserAuthStore } from "../store/useUserAuth"

function BookSeat() {
    const {isUserLoggedIn } = useUserAuthStore();

    if (!isUserLoggedIn) return <div className="p-5 text-center w-full">oops user, please login to Book ticket...</div>

  return (
    <div className="pt-16 px-5">BookSeat</div>
  )
}

export default BookSeat