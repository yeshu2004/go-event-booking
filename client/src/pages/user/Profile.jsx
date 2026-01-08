import { useParams } from "react-router";
import { useUserAuthStore } from "../../store/useUserAuth";
import BookedEventCard from "../../components/BookedEventCard";
import { useQuery } from "@tanstack/react-query";

function Profile() {
  const { id } = useParams();
  console.log(id);

  const { userToken } = useUserAuthStore();

  const getUserDetail = async () => {
    const response = await fetch("http://localhost:8080/api/profile/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Fetching user details failed.");
    }

    return await response.json();
  };

  const getUserBooking = async () => {
    const response = await fetch("http://localhost:8080/api/user/bookings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Fetching user details failed.");
    }

    return await response.json();
  };

  // to fetch user profile details
  const { data, error, status } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserDetail,
    enabled: !!userToken,
  });
  const userData = data?.data;
  console.log("user data:", userData);

  // to fetch bookings of user
  const {
    data: bookingData,
    error: bookingErr,
    status: bookingStatus,
  } = useQuery({
    queryKey: ["user-bookings"],
    queryFn: getUserBooking,
    enabled: !!userToken,
  });

  const userBookings = bookingData?.data;
  console.log(userBookings)
  const userTotalBooking = bookingData?.count;

  if(!userToken){
    return(
      <div className="p-5">Please login...</div>
    )
  }

  return (
    <div className="relative w-full min-h-screen bg-gray-50 py-10 md:px-6 p-5 flex flex-col md:flex-row item-center lg:gap-10 gap-7">
      {/* Profile Card */}
      {status == "error" && (
        <div className="p-5">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading events: {error.message}</p>
            <p className="text-sm mt-1">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      )}

      {status == "pending" && (
        <div className="w-full">
          <div className="text-center py-8 w-1/2">
            <p className="text-gray-500">Fetching user profile...</p>
          </div>
        </div>
      )}

      {status == "success" && (
        <div className="md:min-w-[35vw] lg:min-w-[30vw] xl:min-w-[25vw] bg-white rounded-xl shadow-sm p-6 h-fit">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-semibold text-blue-600 uppercase">
              {userData.first_name[0]}
            </div>

            {/* Fun tagline */}
            <div className="mt-2 flex justify-center">
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                ✨ Joined{" "}
                {new Date(userData.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t text-zinc-200" />

          {/* Contact Info */}
          <div className="space-y-3 text-sm">
            <InfoRow label="Email" value={userData.email} />
            <InfoRow label="Phone" value={userData?.phone} />
            <InfoRow label="Password" value="xxxxx" />
          </div>

          {/* Divider */}
          <div className="my-6 border-t text-zinc-200" />

          <div className="text-xs text-gray-500 text-center">Edit profile</div>
        </div>
      )}

      {/* booked events */}

      {bookingStatus == "error" && (
        <div className="p-5">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">
              Error loading events: {bookingErr.message}
            </p>
            <p className="text-sm mt-1">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      )}

      {bookingStatus == "pending" && (
        <div className="w-full">
          <div className="text-center py-8 w-1/2">
            <p className="text-gray-500">Fetching user bookings...</p>
          </div>
        </div>
      )}

      {bookingStatus == "success" && (
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">My Booked Events</h2>

          {/* // upcoming booked events */}
          <div className="mb-8">
            {/* <h3 className="text-lg font-medium mb-3">Upcoming Events</h3> */}
            {userTotalBooking === 0 && (
              <div className="text-zinc-400">No Upcoming Booked events</div>
            )}
            {userTotalBooking > 0 && (
              <div className="grid-cols-1 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {userBookings.map((booking) => (
                  <BookedEventCard
                    key={booking.id}
                    title={booking.name}
                    date={booking.date}
                    location={booking.city}
                    status={"upcoming"} // upcoming | past
                  />
                ))}
              </div>
            )}
          </div>

          {/* previous events attended
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Past Events</h3>
            {userTotalBooking == 0 && (
              <div className="text-zinc-400">No Past Booked events</div>
            )}
            {userTotalBooking > 0 && (
              <div className="space-y-3 flex flex-wrap gap-5">
                <BookedEventCard
                  title="JS Meetup"
                  date="10 Jan 2025 • 4:00 PM"
                  location="Mumbai"
                  status="past"
                />
              </div>
            )}
          </div> */}
        </div>
      )}
    </div>
  );
}

export default Profile;

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
