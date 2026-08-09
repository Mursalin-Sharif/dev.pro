import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { AppRoutes } from '@/routes'
import { useCountryLocale } from '@/hooks/useCountryLocale'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ScrollToTop } from '@/components/common/ScrollToTop'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

function LocaleBootstrap() {
  useCountryLocale()
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <LocaleBootstrap />
              <AppRoutes />
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
