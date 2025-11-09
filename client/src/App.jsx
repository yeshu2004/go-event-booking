import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function App() {
  const { status, data, error } = useQuery({
    queryKey: ["initial_data"],
    queryFn: fetchWelcome,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  let handleSubmit = async (e) => {
    e.preventDefault();

    let res = await fetch("http://localhost:8080/api/auth/sign-in",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({firstName, lastName, email, password})
    });

    if (res.ok) {
			const data = await res.json();
      console.log("sign-in done")
      localStorage.setItem("firstname", data.first_name)
      localStorage.setItem("emial", data.email)
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
  		} else{
        alert("login failed")
      }

  };

  async function fetchWelcome() {
    const response = await fetch("http://localhost:8080");
    return response.json();
  }

  if (status == "pending") return "fetcing...";

  if (status == "error") return "an error occured" + error.message;

  return (
    <div className="">
      {data.message}

    <div className="pt-10 flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 border rounded shadow-md">
        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700" >FirstName</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
          required
        />
        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">LastName</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
          required
        />
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
          required
        />
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-md pt-2" >
          Submit
        </button>
      </form>

    </div>
      {/* <h1>{message.length == 0 ? "fetching.." : message}</h1> */}
      {/* <h1>{data.message}</h1> */}
      {/* <Example /> */}
    </div>
  );
}

export default App;

function Example() {
  const { isPending, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: async () =>
      await fetch("https://api.github.com/repos/TanStack/query").then((res) =>
        res.json()
      ),
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{" "}
      <strong>✨ {data.stargazers_count}</strong>{" "}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  );
}
