import { useQuery } from "@tanstack/react-query";
import { FaArrowRight } from "react-icons/fa6";
import { Link, useParams } from "react-router";
import Timer from "../components/Timer";

function Event() {
  const param = useParams();
  console.log(param.event_id);

  const getEventImage = async (key) => {
    const response = await fetch(
      `http://localhost:8080/api/event/image?key=${key}`
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  };

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

  const getUpcomingEvents = async () => {
    const res = await fetch(
      `http://localhost:8080/api/events/upcoming?city=${eventData.data.city}&exclude=${eventData.data.id}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  };

  const {
    status: eventStatus,
    data: eventData,
    error: eventErr,
  } = useQuery({
    queryKey: ["event", param.event_id],
    queryFn: getEventDetails,
  });

  const {
    data: imageData,
    status: imageStatus,
    isFetching: imageIsFetching,
  } = useQuery({
    queryKey: ["eventImage", eventData?.data.key],
    enabled: !!eventData?.data.key,
    queryFn: () => getEventImage(eventData.data.key),
  });

  const {
    status: upcomingStatus,
    data: upcomingData,
    error: upcomingErr,
  } = useQuery({
    queryKey: ["upcomingEvent", eventData?.data.id],
    enabled: !!eventData?.data.city,
    queryFn: getUpcomingEvents,
  });

  console.log(eventData); // remove
  console.log(upcomingData); // remove

  return (
    <div className="">
      {eventStatus == "pending" && (
        <div>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading events...</p>
          </div>
        </div>
      )}

      {eventStatus == "error" && (
        <div className="p-5">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading events</p>
            <p className="text-sm mt-1">
              {eventErr?.message || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      )}

      {eventStatus === "success" && (
        // about event
        <div className="w-full h-full px-2 md:px-6 py-5">
          <div className="w-full flex flex-col md:flex-row gap-10">
            {/* IMG SECTION */}
            <div className="md:w-1/3 xl:w-1/4">
              <div className="relative h-[60vh] w-full bg-black/60 flex items-center justify-center">
                <div>
                  <img
                    src={
                      imageStatus === "success"
                        ? imageData.imageUrl
                        : ""
                    }
                    alt="Event banner"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* <div className="bg-black/10 absolute top-0 left-0 h-full w-full"></div> */}
                </div>
                <div className="relative z-10 text-center px-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">
                    {eventData.data.name}
                  </h1>
                  <p className="text-gray-300 mt-3 text-lg">
                    Organized by:{" "}
                    <Link
                      to={`/about/organisations/${eventData.data.org_id}`}
                      className="font-semibold"
                    >
                      {eventData.data.organized_by}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="lg:h-12 md:h-24 h-12 w-full text-white mt-1 flex flex-row lg:flex-row md:flex-col items-center md:gap-1 lg:gap-1">
                <div className="h-full w-1/2 md:w-full lg:w-1/2 flex items-center justify-center  bg-black">
                  <Timer key={eventData.data.id} date={eventData.data.date} />
                </div>
                <div className="bg-indigo-600 text-white h-full w-1/2 md:w-full lg:w-1/2 flex items-center justify-center">
                  {/* CTA */}
                  <Link
                    to={`/event/book/${eventData.data.id}`}
                    state={{
                      event: {
                        id: eventData.data.id,
                        name: eventData.data.name,
                        date: eventData.data.date,
                        city: eventData.data.city,
                        state: eventData.data.state,
                      },
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div>Book Your Seat</div>
                    <div className="">
                      <FaArrowRight />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            {/* DETAILS SECTION */}
            <div className="md:w-2/3 px-3 md:px-0">
              <div className="mb-5">
                <h1 className="text-4xl font-semibold">
                  {eventData.data.name}
                </h1>
              </div>
              {/* TODO: description */}
              <div className="my-8">
                <h3 className="text-xl font-semibold text-zinc-800 mb-2">
                  Description
                </h3>
                <p className="text-justify text-zinc-700 bg-zinc-50">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Illum laborum omnis provident tempore, sit doloribus natus
                  commodi. Asperiores dolor accusamus laudantium rem, sunt
                  corrupti ipsum eos accusantium doloribus delectus natus quae
                  aut veritatis aspernatur tenetur voluptates, soluta similique
                  maxime ducimus adipisci voluptatibus iure labore aperiam? Quos
                  nesciunt esse corporis est, omnis, atque perferendis illo sint
                  laborum vel minus suscipit. Dignissimos accusantium dolorem ad
                  itaque maiores! Vel, officiis beatae nam quod id modi quia
                  vero omnis quos. Inventore accusamus facilis voluptas
                  asperiores impedit fugit consectetur atque, praesentium
                  suscipit officiis illo cumque? Nam sit possimus saepe
                  assumenda ea quae ipsa accusamus dolorem.
                </p>
              </div>

              {/* DATE */}
              <div className="mb-8 ">
                <h2 className="text-xl font-semibold text-zinc-800 mb-2">
                  Event Date
                </h2>
                <p className="text-gray-700 text-lg bg-zinc-50">
                  {new Date(eventData.data.date).toLocaleString("en-IN", {
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
                    {eventData.data.address}
                    <br />
                    {eventData.data.city}, {eventData.data.state}
                    <br />
                    {eventData.data.country}
                  </p>
                </div>
              </div>

              {/* CAPACITY GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div className="">
                  <h3 className="text-sm font-medium text-gray-500">
                    Seats Available
                  </h3>
                  <p className="text-2xl font-semibold mt-1 text-zinc-800 ">
                    {eventData.data.seats_available}
                  </p>
                </div>

                <div className="bg-zinc-50 ">
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Capacity
                  </h3>
                  <p className="text-2xl font-semibold mt-1 text-zinc-800">
                    {eventData.data.capacity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* upcoming events */}
          <div className="pt-10">
            <div className="text-2xl font-semibold capitalize">
              More event's you may Like
            </div>
            {upcomingStatus == "pending" && (
              <div>
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading events...</p>
                </div>
              </div>
            )}

            {upcomingStatus == "error" && (
              <div className="p-5">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <p className="font-medium">Error loading events</p>
                  <p className="text-sm mt-1">
                    {upcomingErr?.message ||
                      "Something went wrong. Please try again."}
                  </p>
                </div>
              </div>
            )}

            {upcomingStatus == "success" && (
              <div className="pt-5">
                {upcomingData?.data == null || upcomingData.data.length == 0 ? (
                  <p className="text-gray-400 ">No upcoming events</p>
                ) : (
                  <div className="flex items-center gap-2 overflow-hidden overflow-x-scroll pt-5">
                    {upcomingData.data.map((event, id) => {
                      return (
                        <div key={id} className="h-full w-62">
                          <div className="h-[35vh] relative full bg-zinc-900 shrink-0 overflow-hidden">
                            <div className="absolute w-full top-0 py-1 text-xl bg-zinc-800/60 text-white text-center z-50">{event.name}</div>
                            <img src={event.image_url} className="h-full w-full object-cover" />
                            <div className="absolute h-full w-full bg-black/20 top-0 left-0"></div>
                          </div>
                          <div className="w-full h-10 flex items-center ">
                            <div className="w-1/2 h-full bg-zinc-800 text-white text-center items-center justify-center flex">
                              {new Date(event.date).toLocaleString("en-IN", {
                                dateStyle: "medium",
                              })}
                            </div>
                            <div className="w-1/2 bg-indigo-600 flex items-center justify-center h-full text-white">
                              <Link
                                to={`/about/event/${event.id}`}
                                className=""
                              >
                                View Deatils
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Event;
