function BookedEventCard({ title, date, location, status }) {
  const isUpcoming = status === "upcoming";

  const borderAccent = isUpcoming
    ? "border-t-4 border-indigo-200"
    : "border-t-4 border-gray-400";

  return (
    <div
      className={`bg-white h-fit rounded-xl shadow-sm p-4 flex-col justify-between items-center gap-6  ${borderAccent} w-full `}
    >
      {/* Left Content */}
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <div className="text-sm text-gray-500 space-y-0.5">
          <p>{date}</p>
          <p>{location}</p>
        </div>
      </div>

      {/* Action */}
      <button
        className={`text-sm font-medium px-4 py-2 rounded-md transition mt-2 w-full
          ${
            isUpcoming
              ? "bg-indigo-600 text-white cursor-pointer"
              : "border border-gray-300 text-gray-600 hover:bg-gray-100"
          }
        `}
      >
        {isUpcoming ? "View Ticket" : "View Event"}
      </button>
    </div>
  );
}

export default BookedEventCard;