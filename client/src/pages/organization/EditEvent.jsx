import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useOrgAuthStore } from "../../store/useOrgAuth";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id)
  const { orgToken } = useOrgAuthStore();
  const queryClient = useQueryClient();
 

  const getEventDetails = async () => {
    const response = await fetch(`http://localhost:8080/api/event/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  };

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

  async function deleteEvent(id){
    if (!confirm("Are you sure you want to delete this event?")) return;

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

    await response.json()
    alert("Event deleted successfully");
    navigate(-1);
  }

  const [event, setEvent] = useState(null);
  const [originalEvent, setOriginalEvent] = useState(null);

  const { data, status, error } = useQuery({
    queryKey: ["eventDetails", id],
    queryFn: getEventDetails,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data?.data || event) return;

    const loadEvent = async () => {
      const e = data.data;

      let imageUrl = "";
      if (e.key) {
        const imgRes = await getEventImage(e.key);
        // console.log("Image URL response:", imgRes); // remove after debugging
        imageUrl = imgRes.imageUrl;
      }

      setOriginalEvent({
        name: e.name ?? "",
        date: e.date?.split("T")[0] ?? "",
        time: e.time ?? "12:30",
        address: e.address ?? "",
        city: e.city ?? "",
        state: e.state ?? "",
        country: e.country ?? "",
        capacity: e.capacity ?? 0,
        seats_available: e.seats_available ?? 0,
        visibility: e.visible?.toUpperCase() ?? "PUBLIC",
        image: imageUrl,
      });

      setEvent({
        name: e.name ?? "",
        date: e.date?.split("T")[0] ?? "",
        time: e.time ?? "12:30",
        address: e.address ?? "",
        city: e.city ?? "",
        state: e.state ?? "",
        country: e.country ?? "",
        capacity: e.capacity ?? 0,
        seats_available: e.seats_available ?? 0,
        visibility: e.visible?.toUpperCase() ?? "PUBLIC",
        image: imageUrl,
      });
    };
    
    loadEvent();
  }, [data]);

  const seatsBooked = event ? event.capacity - event.seats_available : 0;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setEvent((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      // const criticalChanges = [];
      // if(event.name !== originalEvent.name) criticalChanges.push("NAME")
      // if(event.date !== originalEvent.date) criticalChanges.push("DATE_TIME")
      // if(event.address !== originalEvent.address) criticalChanges.push("ADDRESS")
      // if(event.city !== originalEvent.city) criticalChanges.push("CITY")
      // if(event.state !== originalEvent.state) criticalChanges.push("STATE")
      // if(event.country !== originalEvent.country) criticalChanges.push("COUNTRY")

      const buildDateTime = () => {
        if (!event.date || !event.time) return null;
        return new Date(`${event.date}T${event.time}`).toISOString();
      };
      
      const payload = {
        name: event.name,
        date_time: buildDateTime(),
        address: event.address,
        city: event.city,
        state: event.state,
        country: event.country,
        capacity: event.capacity,
        visible: event.visibility.toLowerCase(),
        // criticalChanges: criticalChanges,
      };

      console.log(payload)

      const res = await fetch(`http://localhost:8080/api/update/event/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${orgToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }

      alert("event updated sucessfully");
      queryClient.invalidateQueries(["eventDetails", id]);
      queryClient.invalidateQueries(["orgEvents"]);
      navigate(-1);
    } catch (err) {
      alert(err.message);
    }
  };


  if (status === "pending") {
    return <div className="p-6">Loading event...</div>;
  }

  if (status === "error") {
    return <div className="p-6 text-red-500">{error.message}</div>;
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="px-6 pt-4 flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold">Edit Event</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back to My Events
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col md:flex-row gap-8">
        {/* Image Section */}
        <div className="space-y-2 md:w-[30vw] w-full">
          <div className="md:w-[30vw] h-[70vh] relative overflow-hidden">
            <img
              src={event.image}
              alt="Event"
              className="bg-cover w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
              <button className="bg-white text-black px-4 py-2 text-sm font-medium rounded">
                Change Image
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">Recommended size: 1200 × 600</p>
        </div>

        {/* Form Section */}
        <div className="space-y-6 w-full ">
          {/* Title */}
          <div>
            <label className="text-sm font-medium">Event Name</label>
            <input
              name="name"
              value={event.name}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={event.date}
                onChange={handleChange}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <input
                type="time"
                name="time"
                value={event.time}
                onChange={handleChange}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              name="address"
              value={event.address}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex items-center gap-5 w-full">
            <div>
              <label className="text-sm font-medium">City</label>
              <input
                name="city"
                value={event.city}
                onChange={handleChange}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <input
                name="state"
                value={event.state}
                onChange={handleChange}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <input
                name="country"
                value={event.country}
                onChange={handleChange}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Capacity & Booked */}
          <div className="flex items-center gap-5">
            <div className="">
              <label className="text-sm font-medium">Seats Booked</label>
              <input
                readOnly
                name="seats_booked"
                value={seatsBooked || 0}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <input
                type="number"
                name="capacity"
                min={seatsBooked}
                value={event.capacity}
                onChange={handleChange}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-sm font-medium block mb-2">Visibility</label>
            <div className="flex gap-3">
              {["PUBLIC", "PRIVATE"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEvent({ ...event, visibility: v })}
                  className={`px-4 py-2 border rounded text-sm capitalize ${
                    event.visibility === v ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {/* <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              defaultValue={event.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full border px-3 py-2 rounded resize-none"
            />
          </div> */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full mx-auto px-6 pb-10 flex justify-between items-center">
        <button onClick={()=> deleteEvent(id)} className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50">
          Delete Event
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Update Event
          </button>
        </div>
      </div>
    </div>
  );
}
