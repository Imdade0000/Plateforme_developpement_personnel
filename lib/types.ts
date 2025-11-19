// lib/types.ts
export type UserWith2FA = {
  id: string
  email: string
  name: string | null
  image: string | null
  password: string | null
  role: string
  emailVerified: Date | null
  bio: string | null
  phone: string | null
  country: string | null
  createdAt: Date
  updatedAt: Date
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  twoFactorBackupCodes: string | null
  resetPasswordToken: string | null
  resetPasswordExpires: Date | null
}

export const parseBackupCodes = (backupCodes: string | null): string[] => {
  return backupCodes ? JSON.parse(backupCodes) : []
}

export const stringifyBackupCodes = (backupCodes: string[]): string => {
  return JSON.stringify(backupCodes)
}