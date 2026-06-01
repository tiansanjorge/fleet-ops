import { Vehicle, Alert, User } from "@fleetops/types";

export const db: {
  vehicles: Vehicle[];
  alerts: Alert[];
  users: User[];
} = {
  vehicles: [
    {
      id: "v1",
      label: "Truck 01",
      position: [-34.615, -58.43], // Almagro
      status: "moving",
    },
    {
      id: "v2",
      label: "Truck 02",
      position: [-34.619, -58.447], // Caballito
      status: "idle",
    },
    {
      id: "v3",
      label: "Truck 03",
      position: [-34.589, -58.426], // Palermo
      status: "stopped",
    },
    {
      id: "v4",
      label: "Truck 04",
      position: [-34.563, -58.455], // Belgrano
      status: "moving",
    },
    {
      id: "v5",
      label: "Truck 05",
      position: [-34.572, -58.479], // Villa Urquiza
      status: "moving",
    },
    {
      id: "v6",
      label: "Truck 06",
      position: [-34.599, -58.502], // Devoto
      status: "idle",
    },
    {
      id: "v7",
      label: "Truck 07",
      position: [-34.601, -58.441], // Villa Crespo
      status: "moving",
    },
    {
      id: "v8",
      label: "Truck 08",
      position: [-34.631, -58.462], // Flores
      status: "stopped",
    },
  ],
  alerts: [],
  users: [
    {
      id: "u1",
      name: "Ana García",
      role: "admin",
    },
    {
      id: "u2",
      name: "Carlos Méndez",
      role: "operator",
    },
    {
      id: "u3",
      name: "Laura Ríos",
      role: "viewer",
    },
  ],
};
