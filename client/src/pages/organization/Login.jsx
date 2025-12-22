import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useOrgAuthStore } from "../../store/useOrgAuth";
import { useUserAuthStore } from "../../store/useUserAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loginOrg = useOrgAuthStore((state)=>state.loginOrg)

  // when user comes to login as a org, logout him as user!
  // (could be done better as an when client clicks on login button
  // as org, logout normal user)
  const logoutUser = useUserAuthStore((state)=> state.logoutUser)
  useEffect(()=>{
    logoutUser();
  },[])

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmail("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8080/api/auth/organization/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      console.log(data); // remove

      if (!res.ok) {
        setLoading(false);
        if (res.status == 401) {
          setError("invaild email or passoword");
        }
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      loginOrg(data.data.token)
      setEmail("");
      setPassword("");
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    }
  };
  return (
    <div className="p-5">
      <div>
        <h1>Login Organization</h1>
      </div>
      <form onSubmit={handleSubmit} className="pt-5 max-w-1/2">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Organization Email
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

        <div className="pb-2">
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

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading..." : "Login"}
        </button>
        <div className="italic text-center">
          don't have account,{" "}
          <Link to="/organization/signup" className="underline">
            register now
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
