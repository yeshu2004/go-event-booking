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
    <div className="pt-16 px-5">
      {/* {data.message} */}
      
    </div>
  );
}

export default App;
