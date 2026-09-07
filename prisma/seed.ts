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
          logo: {
            alt: "YS Innovations",
            url: "https://res.cloudinary.com/subash-cms/image/upload/v1788346719/image-8.png",
            title: "YS Innovations",
          },
          navItems: [
            {
              id: "1",
              label: "Home",
              url: { url: "/", newTab: false, noFollow: false },
              subItems: [],
            },
            {
              id: "2",
              label: "Our Services",
              url: { url: "#services", newTab: false, noFollow: false },
              subItems: [
                { label: "Digital Marketing", url: { url: "/digital-marketing", newTab: false, noFollow: false } },
                { label: "App development", url: { url: "/app-development", newTab: false, noFollow: false } },
                { label: "Website development", url: { url: "/web-development", newTab: false, noFollow: false } },
                { label: "Wordpress development", url: { url: "/wordpress-development", newTab: false, noFollow: false } },
              ],
            },
            {
              id: "3",
              label: "Contact Us",
              url: { url: "/contact", newTab: false, noFollow: false },
              subItems: [],
            },
            {
              id: "4",
              label: "Careers",
              url: { url: "/careers", newTab: false, noFollow: false },
              subItems: [],
            },
            {
              id: "5",
              label: "Blog",
              url: { url: "/blogs", newTab: false, noFollow: false },
              subItems: [],
            },
          ],
          ctaButton: {
            text: "Get Started",
            url: "/contact",
            newTab: false,
            noFollow: false,
          },
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
            title: "Let's Build Future Together.",
            button: {
              text: "Get In Touch",
              url: "/contact",
              newTab: false,
              noFollow: false,
            },
            image: { url: "", alt: "" },
          },
          columns: [
            {
              title: "Resources",
              links: [
                { text: "Our Products", url: "/our-products", newTab: false, noFollow: false },
                { text: "About Us", url: "/about-us", newTab: false, noFollow: false },
                { text: "Careers", url: "/careers", newTab: false, noFollow: false },
                { text: "Blog", url: "/blogs", newTab: false, noFollow: false },
                { text: "Our Story", url: "/our-story", newTab: false, noFollow: false },
              ],
            },
            {
              title: "Services",
              links: [
                { text: "SEO", url: "/seo", newTab: false, noFollow: false },
                { text: "Graphic Design & Branding", url: "/graphic-design-branding", newTab: false, noFollow: false },
                { text: "Ecommerce Solution", url: "/ecommerce-solution", newTab: false, noFollow: false },
                { text: "Web design and development", url: "/web-design-and-development", newTab: false, noFollow: false },
                { text: "Digital Marketing", url: "/digital-marketing", newTab: false, noFollow: false },
              ],
            },
          ],
          contact: {
            email: {
              text: "team@ysinnovations.com",
              url: "mailto:team@ysinnovations.com",
              newTab: false,
              noFollow: false,
            },
            phone: {
              text: "+91-8778900553",
              url: "tel:+918778900553",
              newTab: false,
              noFollow: false,
            },
            address: {
              text: "Ekta Plaza, Indira Garden Road, Uppilipalayam, Coimbatore – 641015",
              url: "https://maps.app.goo.gl/mi5NMsi5QnnwW8YDA",
              newTab: true,
              noFollow: false,
            },
          },
          copyright: `YSInnovations © ${new Date().getFullYear()}. All right reserved.`,
          newsletter: {
            title: "Subscribe to Our",
            highlight: "Newsletter",
          },
          policyLinks: [
            { text: "Privacy & Policy", url: "/privacy-policy", newTab: false, noFollow: false },
            { text: "Terms & Condition", url: "/terms-and-conditions", newTab: false, noFollow: false },
          ],
          socialLinks: [
            { text: "facebook", url: "https://www.facebook.com/ysinnovations", newTab: true, noFollow: false },
            { text: "x", url: "https://x.com/ysinnovations", newTab: true, noFollow: false },
            { text: "instagram", url: "https://www.instagram.com/ysinnovations/", newTab: true, noFollow: false },
            { text: "linkedin", url: "https://www.linkedin.com/company/ysinnovations", newTab: true, noFollow: false },
          ],
          backgroundImage: { url: "", alt: "" },
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
