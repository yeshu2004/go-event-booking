import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useOrgAuthStore } from "../../store/useOrgAuth";

function CreateEvent() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [eventName, setEventName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [isVisible, SetIsVisible] = useState("PUBLIC");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { orgToken, isOrgLoggedIn } = useOrgAuthStore();
  const logoutOrg = useOrgAuthStore((state) => state.logoutOrg);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOrgLoggedIn) navigate("/organization/login", { replace: true });
  }, [isOrgLoggedIn, navigate, orgToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const eventData = {
        name: eventName,
        capacity: parseInt(capacity),
        date: date ? new Date(date).toISOString() : null,
        address: address,
        city: city,
        state: state,
        country: country,
        key: "",
        visible: isVisible
      };

      if (!selectedImage) {
        setError("please select an event image");
        setLoading(false);
        return;
      }
      if(selectedImage.type !== "image/jpeg" && selectedImage.type !== "image/png"){
        setError("only jpeg and png images format are allowed");
        setLoading(false);
        return;
      }
      
      if(selectedImage.size > 5 * 1024 * 1024){
        setError("image size should be less than 5MB");
        setLoading(false);
        return;
      }

      // first: get pre-signed url and key
      const presignedRes = await fetch("http://localhost:8080/api/event/image/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${orgToken}`,
        },
        body: JSON.stringify({
          fileName: selectedImage.name,
          fileType: selectedImage.type,
        }),
      });
      
      if (!presignedRes.ok) {
        setLoading(false);
        throw new Error("failed to get upload URL");
      }
      
      const presignRes = await presignedRes.json();
      console.log(presignRes); // remove
      const { uploadUrl, presignKey } = presignRes;

      // next: upload image using pre-signed url
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedImage.type,
        },
        body: selectedImage,
      });

      if (!uploadRes.ok) {
        setLoading(false);
        throw new Error("image upload url failed, try again");
      }
      console.log(uploadRes); // remove

      // finally: store key & data in db
      eventData.key = presignKey;
      const res = await fetch("http://localhost:8080/api/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${orgToken}`,
        },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      console.log(data); // remove

      if (!res.ok) {
        setLoading(false);
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSelectedImage(null);
      setSuccess("Event created successfully!");
      setEventName("");
      setCapacity("");
      setDate("");
      setAddress("");

      setCity("");
      setState("");
      setCountry("");
      setLoading(false);
    } catch (err) {
      setError("Network error. Please check your connection.");
      setLoading(false);
      console.error(err);
    }
  };

  if (!isOrgLoggedIn) {
    return (
      <div className="p-5">
        <h1>Please login in to continue...</h1>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <button onClick={logoutOrg} className="underline cursor-pointer">
          Logout
        </button>
      </div>
      <div className="pt-5">
        <div className="max-w-1/2">
          <h1 className="font-medium pb-2">Create new event </h1>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Image
              </label>
              {selectedImage && (
                <div>
                  <img
                    alt="not found"
                    width={"100px"}
                    src={URL.createObjectURL(selectedImage)}
                  />
                </div>
              )}
              <input
                type="file"
                name="myImage"
                className="border-dotted border px-4 py-2 rounded-lg cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files[0];
                  console.log(file);
                  if (file) setSelectedImage(e.target.files[0]);
                }}
              />
              {selectedImage && (
                <button
                  type="button"
                  className="ml-3 text-sm "
                  onClick={() => setSelectedImage(null)}
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event capacity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter street address"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                />
              </div>

              <div>
                <label htmlFor="">Visible</label>
                <select
                  name=""
                  id=""
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={isVisible}
                  onChange={(e) => SetIsVisible(e.target.value)}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
