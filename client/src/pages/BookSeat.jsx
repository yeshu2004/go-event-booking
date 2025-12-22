import { useState } from "react";
import { Link, useParams } from "react-router";
import { useUserAuthStore } from "../store/useUserAuth";
import { useQuery } from "@tanstack/react-query";

function BookTicket() {
  const { isUserLoggedIn } = useUserAuthStore();
  let param = useParams();

  const {userData} = useUserAuthStore();
// console.log(userData)
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

  const { status, error, data: event } = useQuery({
    queryKey: ["eventData", param.event_id],
    queryFn: getEventDetails,
    // refetchInterval: 20, // every 20 sec, client will re-query the data (for seats_availability)
  });

  const [tickets, setTickets] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");

  const ticketPrice = 499;
  const platformFee = 20;
  const total = ticketPrice * tickets + platformFee;

  if (!isUserLoggedIn)
    return (
      <div className="p-5 text-center w-full">
        oops user, please login to Book ticket...
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-100 px-4 md:px-6 py-8">
      {
        status == "error" &&(
          <div className="p-5">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading events</p>
            <p className="text-sm mt-1">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
        )
      }

      {status == "pending" && (
        <div>
          <div className="text-center py-8">
            <p className="text-gray-500">Fetching seats availability...</p>
          </div>
        </div>
      )}

      { status == "success" && event.data.seats_available == 0 &&(
        <div className="text-center text-xl text-zinc-400 py-10">
          Oops, All seats are booked.
        </div>
      )}

      {status == "success" && event.data.seats_available !== 0 &&(
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-5">
            {/* EVENT SUMMARY */}
            <div className="bg-zinc-900 text-white p-6 rounded-xl">
              <h1 className="text-2xl font-bold">{event.data.name}</h1>
              <p className="text-gray-300 mt-2">
                {new Date(event.data.date).toLocaleString("en-IN", {
                  dateStyle: "long",
                })}{" "}
                • {event.data.city}, {event.data.state}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Seats Available:{" "} {
                event.data.seats_available > 10 ? <span className="text-white">{event.data.seats_available}</span>: <span className="text-white">Only {event.data.seats_available} seats left, availability may change</span>
                }
              </p>
            </div>

            {/* TICKET SELECTION */}
            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Select Tickets</h2>

              <select
                value={tickets}
                onChange={(e) => setTickets(Number(e.target.value))}
                className="w-full border rounded-lg px-4 py-2"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} Ticket{n > 1 && "s"}
                  </option>
                ))}
              </select>
            </div>

            {/* ATTENDEE DETAILS */}
            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Attendee Details</h2>

              <div className="space-y-4">
                <input
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Full Name"
                  defaultValue={userData.full_name}
                />
                <input
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Email Address"
                  defaultValue={userData.email}
                />
                <input
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Phone Number"
                />
              </div>
            </div>

            {/* PAYMENT METHODS */}
            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

              <div className="space-y-3">
                {[
                  "UPI (GPay / PhonePe / Paytm)",
                  "Debit / Credit Card",
                  "Net Banking",
                  "Wallet",
                ].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition
                      ${
                        paymentMethod === method
                          ? "border-indigo-600 bg-indigo-50"
                          : "hover:bg-zinc-50"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION – PRICE SUMMARY */}
          <div className="bg-white p-6 rounded-xl h-fit sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Price Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ticket Price</span>
                <span>
                  ₹{ticketPrice} × {tickets}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              disabled={!paymentMethod}
              className={`w-full mt-6 py-3 rounded-lg text-lg font-semibold transition
                ${
                  paymentMethod
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Pay ₹{total} & Book Ticket
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Secure payment • No refunds unless event is cancelled
            </p>

            <Link
              to={`/about/event/${event.data.id}`}
              className="block text-center text-sm text-indigo-600 mt-4"
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

export default BookTicket;
