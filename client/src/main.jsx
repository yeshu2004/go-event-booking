import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
// import { persistQueryClient } from '@tanstack/react-query-persist-client'

import {BrowserRouter, Route, Routes} from "react-router"
import Signup from './pages/user/Signup.jsx'
import Login from './pages/user/Login.jsx'
import Events from './pages/Events.jsx'
import Register from './pages/organization/Register.jsx'
import OrgLogin from './pages/organization/Login.jsx'
import Dashboard from './pages/organization/Dashboard.jsx'
import AboutOrg from './pages/AboutOrg.jsx'
import Event from './pages/Event.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/user/signup' element={<Signup/>}/>
        <Route path='/user/login' element={<Login/>}/>
        <Route path='/organization/signup' element={<Register/>}/>
        <Route path='/organization/login' element={<OrgLogin/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/events' element={<Events/>}/>
        <Route path='/about/organisations/:orgId' element={<AboutOrg/>}/>
        <Route path='/about/event/:event_id' element={<Event/>}/>
      </Routes>
    </QueryClientProvider>
  </BrowserRouter>,
)
