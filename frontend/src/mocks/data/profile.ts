import { type Profile, type ShippingAddress } from '../../lib/api/endpoints/auth'

// In-memory profile storage for MSW (keyed by email)
const profilesCache: Map<string, Profile> = new Map()

// Load all profiles from localStorage
function loadProfilesFromStorage(): void {
  try {
    const stored = localStorage.getItem('mock_profiles')
    if (stored) {
      const profiles = JSON.parse(stored) as Record<string, Profile>
      Object.entries(profiles).forEach(([email, profile]) => {
        profilesCache.set(email, profile)
      })
    }
  } catch {
    // Ignore errors
  }
}

// Save all profiles to localStorage
function saveProfilesToStorage(): void {
  try {
    const profiles: Record<string, Profile> = {}
    profilesCache.forEach((profile, email) => {
      profiles[email] = profile
    })
    localStorage.setItem('mock_profiles', JSON.stringify(profiles))
  } catch {
    // Ignore errors
  }
}

// Initialize from storage
loadProfilesFromStorage()

export function getMockProfile(userEmail: string): Profile | null {
  // Check cache first
  let profile = profilesCache.get(userEmail)
  
  // If no profile exists, create a default one
  if (!profile) {
    profile = {
      name: userEmail.split('@')[0] || 'User',
      email: userEmail,
      phone: '',
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
      },
    }
    profilesCache.set(userEmail, profile)
    saveProfilesToStorage()
  }
  
  return profile
}

export function updateMockProfile(userEmail: string, updates: Partial<Profile>): Profile {
  const currentProfile = getMockProfile(userEmail)
  
  if (!currentProfile) {
    throw new Error('Profile not found')
  }
  
  // Update profile
  const updatedProfile: Profile = {
    ...currentProfile,
    ...updates,
    email: userEmail, // Ensure email cannot be changed
    shippingAddress: {
      ...currentProfile.shippingAddress,
      ...(updates.shippingAddress || {}),
    } as ShippingAddress, // Type assertion since we're merging with required fields
  }
  
  profilesCache.set(userEmail, updatedProfile)
  saveProfilesToStorage()
  return updatedProfile
}

