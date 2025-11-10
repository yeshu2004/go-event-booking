import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

import {BrowserRouter, Route, Routes} from "react-router"
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      staleTime: 1000 * 1, // 10 sec (after this, silent background fetch and If data changed → UI updates automatically)
      cacheTime: 1000 * 10, // 10 sec
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  }
})

const persister = createAsyncStoragePersister({storage: window.localStorage});
persistQueryClient({queryClient, persister})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </QueryClientProvider>
  </BrowserRouter>,
)
