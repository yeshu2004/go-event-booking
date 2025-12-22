import { useParams } from "react-router";
import { useUserAuthStore } from "../../store/useUserAuth";
import BookedEventCard from "../../components/BookedEventCard";

function Profile() {
  const { id } = useParams();
  console.log(id);

  const { userData } = useUserAuthStore();
  console.log(userData);

  const user = {
    name: "John Doe",
    bio: "Love attending tech & music events 🎶",
    joined: "March 2024",
  };
  return (
    <div className="relative min-h-screen bg-gray-50 py-10 md:px-6 p-5 flex flex-col md:flex-row item-center lg:gap-10 gap-7">
      {/* Profile Card */}
      <div className="md:min-w-[35vw] lg:min-w-[30vw] xl:min-w-[25vw] bg-white rounded-xl shadow-sm p-6 h-fit">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-semibold text-blue-600 uppercase">
            {userData.full_name[0]}
          </div>

          <h1 className="mt-4 text-xl font-semibold capitalize">{userData.full_name}</h1>

          {/* Fun tagline */}
          <div className="mt-2 flex justify-center">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
              🎉 Attended 5+ events
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t text-zinc-200" />

        {/* Contact Info */}
        <div className="space-y-3 text-sm">
          <InfoRow label="Email" value={userData.email} />
          <InfoRow label="Phone" value={userData.phone} />
        </div>

        {/* Divider */}
        <div className="my-6 border-t text-zinc-200" />

        <div className="text-xs text-gray-500 text-center">
          Member since <span className="font-medium">{user.joined}</span>
        </div>
      </div>

      {/* booked events */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">My Booked Events</h2>

        {/* // upcoming booked events */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Upcoming Events</h3>
          <div className="grid-cols-1 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <BookedEventCard
              title="React Conf 2025"
              date="12 Feb 2025 • 10:00 AM"
              location="Bangalore"
              status="upcoming"
            />
            <BookedEventCard
              title="Music Fest"
              date="20 Feb 2025 • 6:00 PM"
              location="Delhi"
              status="upcoming"
            />
            <BookedEventCard
              title="React Conf 2025"
              date="12 Feb 2025 • 10:00 AM"
              location="Bangalore"
              status="upcoming"
            />
          </div>
        </div>

        {/* previous events attended */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Past Events</h3>
          <div className="space-y-3 flex flex-wrap gap-5">
            <BookedEventCard
              title="JS Meetup"
              date="10 Jan 2025 • 4:00 PM"
              location="Mumbai"
              status="past"
            />
          </div>
        </div>
      </div>
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
