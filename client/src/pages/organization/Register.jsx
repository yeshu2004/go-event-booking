import { useState } from "react";
import { Link, useNavigate } from "react-router";

const Register = () => {
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8080/api/auth/organization/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            org_name: orgName,
            email,
            password,
            description,
          }),
        }
      );
      const data = await res.json();
      console.log(data); // remove

      if (!res.ok) {
        setLoading(false);
        if (res.status === 409) {
          setError("Organization already exists with this email.");
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setOrgName("");
      setEmail("");
      setPassword("");
      setDescription("");
      setLoading(false);
      navigate("/organization/login");
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    }
  };

  return (
    <div className="p-5">
      <div>
        <h1>Register Organization</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-1/2 pt-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="orgName"
            className="block text-sm font-medium text-gray-700"
          >
            Organization Name
          </label>
          <input
            id="orgName"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        <div className="pb-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <input
            id="description"
            type="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an organization account?{" "}
          <Link to="/organization/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
