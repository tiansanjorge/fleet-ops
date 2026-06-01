import { http, HttpResponse } from "msw";
import { db } from "./db";
import type { Vehicle, UserRole } from "@fleetops/types";

function generateId(): string {
  return `v${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const handlers = [
  http.get("/vehicles", () => {
    return HttpResponse.json(db.vehicles);
  }),

  http.post("/vehicles", async ({ request }) => {
    const body = (await request.json()) as Omit<Vehicle, "id">;
    const vehicle: Vehicle = { ...body, id: generateId() };
    db.vehicles.push(vehicle);
    return HttpResponse.json(vehicle, { status: 201 });
  }),

  http.put("/vehicles/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as Partial<Vehicle>;
    const index = db.vehicles.findIndex((v) => v.id === id);
    if (index === -1)
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    db.vehicles[index] = { ...db.vehicles[index], ...body };
    return HttpResponse.json(db.vehicles[index]);
  }),

  http.delete("/vehicles/:id", ({ params }) => {
    const { id } = params as { id: string };
    const index = db.vehicles.findIndex((v) => v.id === id);
    if (index === -1)
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    db.vehicles.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/alerts", () => {
    return HttpResponse.json(db.alerts);
  }),

  http.get("/users", () => {
    return HttpResponse.json(db.users);
  }),

  http.patch("/users/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as { role: UserRole };
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1)
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    db.users[index] = { ...db.users[index], role: body.role };
    return HttpResponse.json(db.users[index]);
  }),
];
