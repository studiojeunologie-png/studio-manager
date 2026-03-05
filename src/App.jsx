import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'

// Pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ClientsPage from '@/pages/ClientsPage'
import CalendarPage from '@/pages/CalendarPage'
import TransactionsPage from '@/pages/TransactionsPage'
import MediaPage from '@/pages/MediaPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Page de connexion */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes protégées avec layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin seulement */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute adminOnly>
                    <ClientsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute adminOnly>
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin + Client */}
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/media" element={<MediaPage />} />
            </Route>

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1A1A2E',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
