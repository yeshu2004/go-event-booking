import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";

function Events() {
  const { token, isLoggedIn } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);

  const getEvents = async () => {
    if (!token) {
      throw new Error("No token available");
    }

    const response = await fetch("http://localhost:8080/api/events", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    enabled: isLoggedIn && !!token,
  });

  if (!isLoggedIn) return <div>please login to continue...</div>;
  console.log(data);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Events</h1>
        <button
          onClick={logout}
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
                <span className="font-medium">{event.organizedBy}</span>
              </p>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Date:{" "}</span>
                  <span>
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
                <p><span className="font-medium">Location:{" "}</span>
                  {event.address}, {event.city}, {event.state}, {event.country}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
