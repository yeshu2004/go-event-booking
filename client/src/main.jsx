import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
// import { persistQueryClient } from '@tanstack/react-query-persist-client'

import {BrowserRouter, Route, Routes} from "react-router"
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Events from './pages/Events.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/events' element={<Events/>}/>
      </Routes>
    </QueryClientProvider>
  </BrowserRouter>,
)
