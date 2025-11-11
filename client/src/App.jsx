// import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

function App() {
  // const { status, data, error } = useQuery({
  //   queryKey: ["initial_data"],
  //   queryFn: fetchWelcome,
  // });

  // async function fetchWelcome() {
  //   const response = await fetch("http://localhost:8080");
  //   return response.json();
  // }

  // if (status == "pending") return "fetcing...";

  // if (status == "error") return "an error occured" + error.message;

  return (
    <div className="">
      {/* {data.message} */}
      <div className="flex items-center gap-5">
        <Link to={"user/signup"}>Register as user</Link>
        <Link to={"/organization/signup"}>Register as organization</Link>
      </div>
    </div>
  );
}

export default App;
