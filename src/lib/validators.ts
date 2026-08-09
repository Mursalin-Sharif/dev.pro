import { z } from 'zod'

function isAtLeastAge(minAge: number) {
  return (dob: string) => {
    if (!dob) return false
    const birthDate = new Date(dob)
    if (Number.isNaN(birthDate.getTime())) return false
    const ageDifMs = Date.now() - birthDate.getTime()
    const ageDate = new Date(ageDifMs)
    const age = Math.abs(ageDate.getUTCFullYear() - 1970)
    return age >= minAge
  }
}

export const registrationSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is too short').max(60),
  lastName: z.string().trim().min(2, 'Last name is too short').max(60),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(isAtLeastAge(6), 'Players must be at least 6 years old'),
  city: z.string().trim().min(2, 'City is required').max(80),
  country: z.string().trim().min(2, 'Country is required'),
  phone: z
    .string()
    .trim()
    .min(6, 'Enter a valid phone number')
    .max(20)
    .regex(/^[+()\d\s-]+$/, 'Enter a valid phone number'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
  confirmPassword: z.string().min(6, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegistrationSchema = z.infer<typeof registrationSchema>

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is too short').max(60),
  lastName: z.string().trim().min(2, 'Last name is too short').max(60),
  city: z.string().trim().min(2, 'City is required').max(80),
  country: z.string().trim().min(2, 'Country is required'),
  phone: z
    .string()
    .trim()
    .min(6, 'Enter a valid phone number')
    .max(20)
    .regex(/^[+()\d\s-]+$/, 'Enter a valid phone number'),
})

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>

export const blogPostSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().trim().min(10, 'Excerpt is required').max(280),
  content: z.string().trim().min(20, 'Content is too short'),
  author: z.string().trim().min(2, 'Author is required'),
  coverImageUrl: z.string().trim().url().optional().or(z.literal('')),
  published: z.boolean(),
})

export type BlogPostSchema = z.infer<typeof blogPostSchema>

export const videoSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  description: z.string().trim().max(400).optional().or(z.literal('')),
  videoUrl: z.string().trim().url('Enter a valid video URL'),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal('')),
  published: z.boolean(),
})

export type VideoSchema = z.infer<typeof videoSchema>

export const sponsorSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  logoUrl: z.string().trim().url('Enter a valid logo URL'),
  websiteUrl: z.string().trim().url().optional().or(z.literal('')),
  tier: z.enum(['platinum', 'gold', 'silver', 'partner']),
})

export type SponsorSchema = z.infer<typeof sponsorSchema>
