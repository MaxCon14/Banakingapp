import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()

  return (
    <div className={`toast ${toast ? toast.type + ' show' : ''}`} role="alert">
      <span className="toast-dot" />
      <span className="toast-msg">{toast?.message}</span>
    </div>
  )
}
