import {create} from "zustand"
import {persist} from "zustand/middleware"


// export const useAuthStore = create((set)=>({
//     token: localStorage.getItem("token") || null,
//     isLoggedIn: !! localStorage.getItem("token"),
//     setToken: (token)=>{
//         if(token){
//             localStorage.setItem("token", token);
//         }else{
//             localStorage.removeItem("token");
//         }
//     },
//     logout: ()=>{
//         localStorage.removeItem("token")
//         set({token: null})
//     }
// })) 

export const useAuthStore = create(persist((set)=>({
        token: null,
        isLoggedIn: false,
        login: (token)=> set({token: token, isLoggedIn: true}),
        logout: ()=> set({token: null, isLoggedIn: true}),
    })
),{name: "token"})