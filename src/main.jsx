import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@mdi/font/css/materialdesignicons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import { StoreProvider, useStore } from './Store.js'
import { mushroomsService } from './service/mushroomsService.js'
import { playerService } from './service/playerService.js'
import App from './App.jsx'

function ServiceBootstrap() {
  const { state, updateState, increment } = useStore()
  useEffect(() => {
    mushroomsService.configure({
      getState: () => state,
      updateState,
      increment,
      openModal: () => document.getElementById('modal-button')?.click(),
    })

    playerService.configure({
      getState: () => state,
      updateState,
      increment,
    })
  }, [state, updateState, increment])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <ServiceBootstrap />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
)
