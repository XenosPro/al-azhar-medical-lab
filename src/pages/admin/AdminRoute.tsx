import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type AdminRouteProps = {
  children: React.ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.rpc('is_admin')

      if (error) {
        console.error('Admin check failed:', error)
        setLoading(false)
        return
      }

      setIsAdmin(data === true)
      setLoading(false)
    }

    checkAdmin()
  }, [])

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          Checking administrator access...
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute