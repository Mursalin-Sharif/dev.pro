import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

const Home = lazy(() => import('@/pages/public/Home'))
const About = lazy(() => import('@/pages/public/About'))
const Videos = lazy(() => import('@/pages/public/Videos'))
const Sports = lazy(() => import('@/pages/public/Sports'))
const SportGame = lazy(() => import('@/pages/public/SportGame'))
const Blog = lazy(() => import('@/pages/public/Blog'))
const BlogPost = lazy(() => import('@/pages/public/BlogPost'))
const Sponsors = lazy(() => import('@/pages/public/Sponsors'))
const Register = lazy(() => import('@/pages/public/Register'))
const Profile = lazy(() => import('@/pages/public/Profile'))
const Login = lazy(() => import('@/pages/public/Login'))
const Account = lazy(() => import('@/pages/public/Account'))
const RegisterSuccess = lazy(() => import('@/pages/public/RegisterSuccess'))
const RegisterCancelled = lazy(() => import('@/pages/public/RegisterCancelled'))
const Contact = lazy(() => import('@/pages/public/Contact'))
const PrivacyPolicy = lazy(() => import('@/pages/public/PrivacyPolicy'))
const TermsOfUse = lazy(() => import('@/pages/public/TermsOfUse'))
const NotFound = lazy(() => import('@/pages/public/NotFound'))

const AdminLogin = lazy(() => import('@/pages/admin/Login'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminRegistrations = lazy(() => import('@/pages/admin/RegistrationsList'))
const AdminVideos = lazy(() => import('@/pages/admin/VideosManager'))
const AdminSponsors = lazy(() => import('@/pages/admin/SponsorsManager'))
const AdminBlog = lazy(() => import('@/pages/admin/BlogManager'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size={28} className="text-primary" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="videos" element={<Videos />} />
          <Route path="sports" element={<Sports />} />
          <Route path="sports/:gameId" element={<SportGame />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Login />} />
          <Route path="account" element={<Account />} />
          <Route path="register/success" element={<RegisterSuccess />} />
          <Route path="register/cancelled" element={<RegisterCancelled />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-use" element={<TermsOfUse />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="sponsors" element={<AdminSponsors />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
