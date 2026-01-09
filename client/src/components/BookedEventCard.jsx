import { useMutation } from "@tanstack/react-query";
import { useUserAuthStore } from "../store/useUserAuth";

function BookedEventCard({ bookingID, title, date, location}) {
  const { userToken } = useUserAuthStore();
  
  const getBookingPdfUrl = async (id) => {
    const response = await fetch(`http://localhost:8080/api/pdf/booking/${id}`,{
      method: "GET",
      headers:{
        Authorization: `Bearer ${userToken}`,
      }
    })
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error || "Fetching booking pdf failed");
    }

    return response.json(); 
  }

  const bookingPdfMutation = useMutation({
    mutationFn: getBookingPdfUrl,
    onSuccess: (data) => {
      window.open(data.data, "_blank");
    },
    onError: (error) => {
      alert(error.message);
    },
  });
  
  const borderAccent = "border-t-4 border-indigo-200"

  return (
    <div
      className={`bg-white h-fit rounded-xl shadow-sm p-4 flex-col justify-between items-center gap-6  ${borderAccent} w-full `}
    >
      {/* Left Content */}
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <div className="text-sm text-gray-500 space-y-0.5">
          <p>{new Date(date).toLocaleString("en-IN", {
                  dateStyle: "medium",
          })}</p>
          <p>{location}</p>
        </div>
      </div>

      {/* Action */}
      <button
        type="button"
        disabled={bookingPdfMutation.isPending}
        onClick={() => bookingPdfMutation.mutate(bookingID)}
        className={`text-sm font-medium px-4 py-2 rounded-md transition w-full
          ${
            bookingPdfMutation.isPending
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
      >
        {bookingPdfMutation.isPending ? "Loading ticket..." : "View Ticket"}
      </button>
    </div>
  );
}

export default BookedEventCard;