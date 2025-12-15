import { useQuery } from "@tanstack/react-query";
import { Link,useParams } from "react-router";
import { FaArrowRight } from "react-icons/fa6";

const AboutOrg = () => {
  const param = useParams();

  const fetchDetails = async () => {
    const response = await fetch(
      `http://localhost:8080/about/organization/${param.orgId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  };

  const { status, data, error } = useQuery({
    queryKey: ["organization"],
    queryFn: fetchDetails,
  });

  console.log(data);

  return (
    <div className="px-5 pt-18">
      {status == "pending" && (
        <div className="text-center">
          <p className="text-gray-500">Loading about organization...</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading about organization</p>
          <p className="text-sm mt-1">
            {error?.message || "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {status == "success" && (
        <div className="">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-xl">{data.data.organization.org_name}</h1>
              <button className="bg-blue-300 text-blue-600 px-5 cursor-pointer">
                Follow
              </button>
            </div>
            <h2 className="text-zinc-600 text-sm">
              {data.data.organization.email}
            </h2>
            <h4 className="pt-2">{data.data.organization.description}</h4>
            <h5 className="text-sm text-zinc-600">
              <span>Joined: </span>
              {new Date(data.data.organization.created_at).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </h5>
          </div>

          <div className="pt-10">
            <h1 className="text-lg font-medium">Upcoming events</h1>
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full pt-5">
              {data.data.events.map((event) => (
                <div key={event.id} className="">
                  <div className="bg-black h-[30vh] w-full"></div>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutOrg;
