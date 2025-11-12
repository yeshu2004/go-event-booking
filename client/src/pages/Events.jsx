import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { useUserAuthStore } from ".././store/useUserAuth";

function Events() {
  const { userToken, isUserLoggedIn } = useUserAuthStore();
  const logoutUser = useUserAuthStore((state) => state.logoutUser);

  const getEvents = async () => {
    if (!userToken) {
      throw new Error("No token available");
    }

    const response = await fetch("http://localhost:8080/api/events", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  };

  const { status, data, error } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    enabled: isUserLoggedIn && !!userToken,
  });

  if (!isUserLoggedIn) return <div>oops user, please login to continue...</div>;
  console.log(data);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Events</h1>
        <button
          onClick={logoutUser}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Logout
        </button>
      </div>
      {status == "pending" && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading events...</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading events</p>
          <p className="text-sm mt-1">
            {error?.message || "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {status == "success" && data.data.length == 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No events available at the moment.</p>
        </div>
      )}

      {status == "success" && data.data.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {data.data.map((event) => (
            <div key={event.id} className="border rounded-sm p-5">
              <h3 className="text-xl font-semibold text-gray-900">
                {event.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Organized by{" "}
                <Link
                  to={`/about/organisations/${event.org_id}`}
                  className="font-medium underline"
                >
                  {event.organized_by}
                </Link>
              </p>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Date: </span>
                  <span>
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      // hour: "2-digit",
                      // minute: "2-digit",
                    })}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Location: </span>
                  {event.city.trim()}, {event.state}, {event.country}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Capacity: <strong>{event.capacity}</strong>
                </span>
                <span className="font-medium">
                  {event.seats_available} seats left
                </span>
              </div>
              <div className="pt-2 text-sm underline">
                <div>
                  <Link to={"/"}>Know more</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
