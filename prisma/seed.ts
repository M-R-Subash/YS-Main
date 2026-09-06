import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined in environment.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database from main.ys...");

  const existingHeader = await prisma.header.findUnique({
    where: { id: "global" },
  });

  if (!existingHeader) {
    await prisma.header.create({
      data: {
        id: "global",
        content: {
          logo: { url: "/logo.png", alt: "YS Innovations" },
          ctaButton: { text: "Get Started", url: "/contact", newTab: false, noFollow: false },
          navItems: [
            { id: "1", label: "Home", url: { url: "/", newTab: false, noFollow: false } },
            { id: "2", label: "Careers", url: { url: "/careers", newTab: false, noFollow: false } },
            { id: "3", label: "Blogs", url: { url: "/blogs", newTab: false, noFollow: false } },
            { id: "4", label: "Contact", url: { url: "/contact", newTab: false, noFollow: false } },
          ],
        },
      },
    });
  }

  const existingFooter = await prisma.footer.findUnique({
    where: { id: "global" },
  });

  if (!existingFooter) {
    await prisma.footer.create({
      data: {
        id: "global",
        content: {
          cta: {
            title: "Let's build something extraordinary together.",
            button: { text: "Start a Conversation", url: "/contact", newTab: false, noFollow: false },
            image: { url: "/placeholder.png", alt: "Footer CTA" },
          },
          socialLinks: [],
          newsletter: { title: "Stay Ahead", highlight: "with industry insights" },
          columns: [],
          contact: {
            address: { text: "Bengaluru, India", url: "#" },
            phone: { text: "+91 98765 43210", url: "tel:+919876543210" },
            email: { text: "contact@ysinnovations.com", url: "mailto:contact@ysinnovations.com" },
          },
          backgroundImage: { url: "/placeholder.png", alt: "Footer Background" },
          copyright: `© ${new Date().getFullYear()} YS Innovations. All rights reserved.`,
          policyLinks: [],
        },
      },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
