import { PrismaClient, VehicleStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const vehicles = [
  { label: "Truck 01", lat: -34.615, lng: -58.43, status: VehicleStatus.moving },
  { label: "Truck 02", lat: -34.619, lng: -58.447, status: VehicleStatus.idle },
  { label: "Truck 03", lat: -34.589, lng: -58.426, status: VehicleStatus.stopped },
  { label: "Truck 04", lat: -34.563, lng: -58.455, status: VehicleStatus.moving },
  { label: "Truck 05", lat: -34.572, lng: -58.479, status: VehicleStatus.moving },
  { label: "Truck 06", lat: -34.599, lng: -58.502, status: VehicleStatus.idle },
  { label: "Truck 07", lat: -34.601, lng: -58.441, status: VehicleStatus.moving },
  { label: "Truck 08", lat: -34.631, lng: -58.462, status: VehicleStatus.stopped },
];

const seedUsers = [
  { name: "Admin", email: "admin@fleetops.dev", role: UserRole.admin, password: "admin123" },
  { name: "Operator", email: "operator@fleetops.dev", role: UserRole.operator, password: "password" },
  { name: "Viewer", email: "viewer@fleetops.dev", role: UserRole.viewer, password: "password" },
];

async function main() {
  await prisma.alert.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }

  for (const { password, ...user } of seedUsers) {
    await prisma.user.create({
      data: { ...user, passwordHash: await bcrypt.hash(password, 10) },
    });
  }

  console.log(`Seeded ${vehicles.length} vehicles and ${seedUsers.length} users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
