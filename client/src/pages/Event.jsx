import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

function Event() {
  const param = useParams();
  console.log(param.event_id);

  const getEventDetails = async () => {
    const response = await fetch(
      `http://localhost:8080/api/event/${param.event_id}`
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  };

  const { status, data, error } = useQuery({
    queryKey: ["event", param.event_id],
    queryFn: getEventDetails,
  });

  console.log(data);

  return (
    <div className="">
      {status == "pending" && (
        <div>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading events...</p>
          </div>
        </div>
      )}

      {status == "error" && (
        <div className="p-5">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading events</p>
            <p className="text-sm mt-1">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="w-full">
          {/* HERO SECTION */}
          <div className="relative h-[60vh] w-full bg-black flex items-center justify-center">
            <div className="relative z-10 text-center px-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">
                {data.data.name}
              </h1>
              <p className="text-gray-300 mt-3 text-lg">
                Organized by:{" "}
                <Link to={`/about/organisations/${data.data.org_id}`} className="font-semibold">{data.data.organized_by}</Link>
              </p>
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="max-w-4xl mx-auto px-6 py-10">
            {/* DATE */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-zinc-800 mb-2">
                Event Date
              </h2>
              <p className="text-gray-700 text-lg">
                {new Date(data.data.date).toLocaleString("en-IN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {/* LOCATION */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-zinc-800 mb-2">
                Location
              </h2>

              <div className="bg-zinc-50">
                <p className="text-gray-700 leading-relaxed">
                  {data.data.address}
                  <br />
                  {data.data.city}, {data.data.state}
                  <br />
                  {data.data.country}
                </p>
              </div>
            </div>

            {/* CAPACITY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="">
                <h3 className="text-sm font-medium text-gray-500">
                  Seats Available
                </h3>
                <p className="text-2xl font-semibold mt-1 text-zinc-800">
                  {data.data.seats_available}
                </p>
              </div>

              <div className="bg-zinc-50 ">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Capacity
                </h3>
                <p className="text-2xl font-semibold mt-1 text-zinc-800">
                  {data.data.capacity}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10">
              <button className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition">
                Book Your Seat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Event;
