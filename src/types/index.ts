export * from './database.types'

export interface NavLink {
  label: string
  href: string
}

export interface NavGroup {
  label: string
  links: NavLink[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FeatureItem {
  id: string
  icon: string
  title: string
  description: string
}

export interface TimelineItem {
  id: string
  quarter: string
  title: string
  items: string[]
  status: 'done' | 'active' | 'upcoming'
}

export interface StatItem {
  id: string
  value: number
  suffix?: string
  label: string
  sublabel?: string
}

export interface TestimonialItem {
  id: string
  name: string
  role: string
  quote: string
  avatarInitials: string
}

export interface RegistrationFormValues {
  firstName: string
  lastName: string
  dateOfBirth: string
  city: string
  country: string
  phone: string
  email: string
}
