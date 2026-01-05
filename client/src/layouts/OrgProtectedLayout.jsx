import { Link, Outlet } from "react-router";

function OrgProtectedLayout() {
  return (
    <div className="">
      {/* side navebar */}
      <div className="border-b py-3 flex items-center justify-center gap-10">
        <Link to="/organization/dashboard">Dashboard</Link>
        <Link to="/organization/create-event">Create Event</Link>
        <Link to="/organization/my-events">My Events</Link>
        <Link to="/organization/bookings">Bookings</Link>
        <Link to="/organization/profile">Profile</Link>
      </div>
      <Outlet />
    </div>
  );
}

export default OrgProtectedLayout;
