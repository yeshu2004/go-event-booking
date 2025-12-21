import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useUserAuthStore } from "../../store/useUserAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const userDetail = useUserAuthStore((state)=> state.userDetail)
  const loginUser = useUserAuthStore((state) => state.loginUser);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  let redirectTo = "/";
  if(redirectParam == "/"){
    redirectTo =  "/events"
  }else{
    redirectTo = redirectParam || "/events"
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(data); // remove

      if (!res.ok) {
        if (res.status == 401) {
          setError("invaild email or passoword");
        }
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      userDetail(data.data);
      loginUser(data.data.token);
      setEmail("");
      setPassword("");
      navigate(redirectTo);
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 ">
      <form onSubmit={handleSubmit} className="p-8 border rounded shadow-md">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        <label htmlFor="email">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md pt-2"
        >
          Login
        </button>
        <div className="italic text-center">
          don't have account,{" "}
          <Link to="/user/signup" className="underline">
            register now
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
