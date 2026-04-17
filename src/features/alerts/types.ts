export type AlertSeverity = 'low' | 'medium' | 'critical'

export interface Alert {
  id: string
  vehicleId: string
  severity: AlertSeverity
  message: string
  timestamp: number
  read: boolean
}