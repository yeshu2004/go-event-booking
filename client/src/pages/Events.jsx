// import { useQuery } from "@tanstack/react-query"
// import { useEffect } from "react"

import { useAuthStore } from "../store/auth"

function Events() {

    // let token = "";
    // useEffect(()=>{
    //     token = localStorage.getItem("token");
    // },[])

    // useQuery({
    //     queryKey: ["events"],
    //     queryFn: getEvents 
    // })

    // const getEvents = async ()=>{
    //     await fetch("/api/list-events", {
    //         headers:{
    //             "Content-Type": "application/json",
    //             "Authorization": `Bearer ${token}`
    //         }
    //     })
    // }
    const {isLoggedIn} = useAuthStore()
    const logout = useAuthStore((state)=> state.logout);

    if(!isLoggedIn) return(
        <div>please login to continue...</div>
    )

  return (
    <div>
        <button onClick={logout} className="underline">logout</button>
    </div>
  )
}

export default Events