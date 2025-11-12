import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useUserAuthStore } from "../store/useUserAuth";
import { useEffect } from "react";

const AboutOrg = () => {
  const param = useParams();
  const { userToken, isUserLoggedIn } = useUserAuthStore();
  const logoutUser = useUserAuthStore((state) => state.logoutUser);
  const navigate = useNavigate();


   useEffect(() => {
      if (!isUserLoggedIn) {
        navigate("/user/login", { replace: true });
      }
    }, [isUserLoggedIn, navigate]);

  const fetchDetails = async () => {
    const response = await fetch(
      `http://localhost:8080/about/organization/${param.orgId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
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
    <div className="p-5">
        <div>
            <button className="underline pb-2" onClick={logoutUser}>Logout</button>
        </div>
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
            <h1 className="lg">Upcoming events</h1>
            <hr />
            <div>
                {/* TODO: about page event card  */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutOrg;
