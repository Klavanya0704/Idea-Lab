import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { DentalServices } from "@/components/site/DentalServices";
import { AdvancedCare } from "@/components/site/AdvancedCare";
import { AppointmentSection } from "@/components/site/AppointmentSection";
import { InfoSection } from "@/components/site/InfoSection";
import { Footer } from "@/components/site/Footer";

const title = "SmileCare Dental Hospital | Premium Dental Care in New Delhi";
const description =
  "Advanced dental care for a healthier, brighter smile. Book implants, orthodontics, cosmetic dentistry and pain-free treatments at SmileCare Dental Hospital.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <main>
        <Hero />
        <DentalServices />
        <AdvancedCare />
        <AppointmentSection />
        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}
