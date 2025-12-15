import Navbar from "../components/Navbar";
import { Outlet } from "react-router";

function UserLayout() {
  return (
    <div className="font-mono">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default UserLayout;
