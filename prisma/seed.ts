import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const services = [
  {
    slug: "laptop-repairs",
    title: "Laptop Repairs",
    summary: "Diagnosis and repair for laptops that are slow, damaged or won't work properly.",
    description:
      "We find out what is wrong with your laptop and explain the problem and options in plain language before any work begins. Repairs depend on the fault and on parts being available.",
  },
  {
    slug: "phone-repairs",
    title: "Phone Repairs",
    summary: "Help with damaged or faulty smartphones, from screens to charging problems.",
    description:
      "We look at the fault, tell you what we find and discuss repair options. Availability of parts can differ by phone model.",
  },
  {
    slug: "software-windows-installation",
    title: "Software & Windows Installation",
    summary: "Operating system and software installation to get your computer running smoothly.",
    description:
      "We install and set up Windows and everyday software. Please back up your files first, as reinstalling can affect stored data.",
  },
  {
    slug: "laptop-accessories",
    title: "Laptop Accessories",
    summary: "Everyday accessories for your laptop, such as chargers, bags and peripherals.",
    description: "Ask us about the accessories you need and confirm availability and price before visiting.",
  },
  {
    slug: "phone-accessories",
    title: "Phone Accessories",
    summary: "Accessories to protect and power your phone.",
    description: "From cases and screen protectors to chargers and earphones. Confirm availability and price with us.",
  },
  {
    slug: "bios-motherboard-repairs",
    title: "BIOS & Motherboard Repairs",
    summary: "Deeper hardware and firmware faults on laptops and computers.",
    description:
      "These are more complex jobs, so we look at the device first and then explain what can and cannot be done.",
  },
];

const categories = [
  { name: "Laptop Accessories", slug: "laptop-accessories" },
  { name: "Phone Accessories", slug: "phone-accessories" },
];

async function main() {
  for (const [i, s] of services.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, sortOrder: i },
    });
  }
  for (const c of categories) {
    await prisma.productCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user creation.");
    return;
  }
  if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — leaving it unchanged.`);
    return;
  }
  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: "Administrator",
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
