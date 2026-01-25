import AnnualReportForm from "@/components/AnnualReportForm";
import HeroSection from "@/components/HeroSection";
// import HeroSection from "@/components/HeroSection";
// import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Form Section with ID for smooth scroll */}
      <div id="annual-report-form">
        <AnnualReportForm />
      </div>
    </div>
  );
}
