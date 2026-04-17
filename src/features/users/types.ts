export type UserRole = 'admin' | 'operator' | 'viewer'

export interface User {
  id: string
  name: string
  role: UserRole
}