export type VehicleStatus = 'moving' | 'idle' | 'stopped'

export interface Vehicle {
  id: string
  label: string
  position: [number, number] // [lat, lng]
  status: VehicleStatus
  driverId?: string
}