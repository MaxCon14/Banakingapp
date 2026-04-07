import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [balance, setBalance]           = useState(null)
  const [currency, setCurrency]         = useState('GBP')
  const [transactions, setTransactions] = useState([])
  const [pots, setPots]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [toast, setToast]               = useState(null) // { message, type: 'success'|'error' }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchBalance = useCallback(async () => {
    try {
      const res = await api.get('/balance')
      setBalance(res.data.balance)
      setCurrency(res.data.currency)
    } catch (err) {
      console.error('fetchBalance:', err.message)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get('/transactions?limit=20')
      setTransactions(res.data.transactions)
    } catch (err) {
      console.error('fetchTransactions:', err.message)
    }
  }, [])

  const fetchPots = useCallback(async () => {
    try {
      const res = await api.get('/pots')
      setPots(res.data)
    } catch (err) {
      console.error('fetchPots:', err.message)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchBalance(), fetchTransactions(), fetchPots()])
  }, [fetchBalance, fetchTransactions, fetchPots])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await refreshAll()
      setLoading(false)
    }
    init()
  }, [refreshAll])

  return (
    <AppContext.Provider
      value={{
        balance,
        currency,
        transactions,
        pots,
        loading,
        toast,
        showToast,
        refreshAll,
        fetchBalance,
        fetchTransactions,
        fetchPots,
        setPots,
        setBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
