import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Dashboard from './screens/Dashboard'
import AddMoney   from './screens/AddMoney'
import Withdraw   from './screens/Withdraw'
import Pots       from './screens/Pots'
import History    from './screens/History'
import BottomNav  from './components/BottomNav'
import Toast      from './components/Toast'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/add"      element={<AddMoney />}  />
          <Route path="/withdraw" element={<Withdraw />}  />
          <Route path="/pots"     element={<Pots />}      />
          <Route path="/history"  element={<History />}   />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </AppProvider>
  )
}
