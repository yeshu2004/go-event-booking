import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router";
import { FaArrowRight } from "react-icons/fa6";
import { useState } from "react";

function Events() {
  const [cursor, setCursor] = useState(0);
  const [limit, setLimit] = useState(10);

  const getEvents = async (id) => {
    const response = await fetch(
      `http://localhost:8080/api/events?id=${id}&limit=${limit}`,{
        headers: {
          "Content-Type": "application/json",
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
  const { status, data, error, isFetching } = useQuery({
    queryKey: ["events", cursor, limit],
    queryFn: () => getEvents(cursor),
    placeholderData: keepPreviousData,
  });

  const events = data?.data ?? [];
  const hasNext = data?.has_next ?? false;
  const nextCursor = data?.next_cursor ?? 0;
  console.log(data); // remove

  return (
    <div className="px-5 pt-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Events</h1>
      </div>
      {status == "pending" ||
        (isFetching && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ))}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading events</p>
          <p className="text-sm mt-1">
            {error?.message || "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {status == "success" && events.length == 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No events available at the moment.</p>
        </div>
      )}

      {status == "success" && events.length > 0 && (
        <div className="relative h-full w-full">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {events.map((event) => (
              <div key={event.id} className="">
                <div className="bg-black h-[35vh] w-full overflow-hidden">
                  <img src={event.image_url} className="bg-center object-cover h-full w-full" />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  By{" "}
                  <Link
                    to={`/about/organisations/${event.org_id}`}
                    className="font-medium underline"
                  >
                    {event.organized_by}
                  </Link>
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {event.name}
                </h3>
                <div className="pt-2 flex items-center justify-between">
                  <div className="leading-none">
                    <h5>Ticket</h5>
                    <h2>
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        // hour: "2-digit",
                        // minute: "2-digit",
                      })}
                    </h2>
                  </div>
                  <div className="-rotate-45">
                    <FaArrowRight />
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/about/event/${event.id}`}
                    className=" w-full text-center"
                  >
                    <button className="w-full bg-orange-600 text-white py-1 font-semibold hover:bg-orange-500 cursor-pointer">
                      Know More!
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="py-10">
            <div className="absolute flex items-center justify-center bottom-0 gap-3">
              <button
                disabled={cursor == 0}
                className={`${
                  cursor != 0 ? "cursor-pointer" : "text-zinc-400"
                }`}
              >
                Prev
              </button>
              <button
                className={`${hasNext ? "cursor-pointer" : "text-zinc-400"}`}
                disabled={!hasNext}
                onClick={() => {
                  setCursor(nextCursor);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
