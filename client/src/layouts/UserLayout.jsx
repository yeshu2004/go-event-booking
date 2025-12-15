import Navbar from "../components/Navbar";
import { Outlet } from "react-router";

function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default UserLayout;
