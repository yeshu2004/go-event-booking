import { useQuery } from "@tanstack/react-query";
import { useOrgAuthStore } from "../../store/useOrgAuth";
import { Link } from "react-router";
import { FaArrowRight } from "react-icons/fa6";

function MyEvents() {
  const { orgToken } = useOrgAuthStore();

  const getEvent = async () => {
    const res = await fetch(
      "http://localhost:8080/api/organization/my-events",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${orgToken}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  };

  async function deleteEvent(id){
    const response = await fetch(`http://localhost:8080/api/delete/event/${id}`, {
      method:"PUT",
      headers:{
        Authorization: `Bearer ${orgToken}`,
      }
    })

    if(!response.ok){
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json()
    console.log(data)
  }

  const {data, status, error} = useQuery({
      queryKey: ["event", orgToken],
      queryFn: getEvent,
    });

    const events = data?.data ?? [];

    console.log(data, status, error);

  return (<div className="p-2">
    {status === "loading" && <p>Loading...</p>}
    {status === "error" && <p>Error: {error.message}</p>}
    {status === "success" && (
      <div className="relative h-full w-full">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {events.map((event) => (
              <div key={event.id} className="">
                <div className="bg-black h-[35vh] w-full overflow-hidden">
                  <img src={event.image_url} className="bg-center object-cover h-full w-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {event.name}
                </h3>
                <h3>{event.vis}</h3>
                <div className="pt-1 flex items-center justify-between">
                  <div className="leading-none">
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
                    to={`edit/${event.id}`}
                    className=" w-full text-center"
                  >
                    <button className="w-full bg-zinc-900 text-white py-1 font-semibold hover:bg-zinc-800 cursor-pointer">
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
        </div>
        </div>
    )}

  </div>);
}

export default MyEvents;
