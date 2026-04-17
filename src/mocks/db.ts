import { Vehicle } from '@/features/vehicles/types'
import { Alert } from '@/features/alerts/types'
import { User } from '@/features/users/types'

export const db: {
  vehicles: Vehicle[]
  alerts: Alert[]
  users: User[]
} = {
  vehicles: [
    {
      id: 'v1',
      label: 'Truck 01',
      position: [-34.603, -58.381],
      status: 'moving',
      driverId: 'u2',
    },
    {
      id: 'v2',
      label: 'Truck 02',
      position: [-34.615, -58.373],
      status: 'idle',
      driverId: 'u3',
    },
    {
      id: 'v3',
      label: 'Truck 03',
      position: [-34.590, -58.395],
      status: 'stopped',
    },
  ],
  alerts: [
    {
      id: 'a1',
      vehicleId: 'v2',
      severity: 'medium',
      message: 'Vehicle idle for more than 10 minutes',
      timestamp: Date.now(),
      read: false,
    },
    {
      id: 'a2',
      vehicleId: 'v3',
      severity: 'critical',
      message: 'Vehicle stopped in restricted area',
      timestamp: Date.now(),
      read: false,
    },
  ],
  users: [
    {
      id: 'u1',
      name: 'Admin User',
      role: 'admin',
    },
    {
      id: 'u2',
      name: 'Operator One',
      role: 'operator',
    },
    {
      id: 'u3',
      name: 'Viewer One',
      role: 'viewer',
    },
  ],
}