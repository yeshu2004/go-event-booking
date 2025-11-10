import {create} from "zustand"
import {persist} from "zustand/middleware"

export const useAuthStore = create(persist((set)=>({
        token: null,
        isLoggedIn: false,
        login: (token)=> set({token: token, isLoggedIn: true}),
        logout: ()=> set({token: null, isLoggedIn: false}),
    })
),{name: "token"})