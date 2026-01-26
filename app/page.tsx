import AnnualReportForm from "@/components/home-page/AnnualReportForm";
import BrandHeader from "@/components/home-page/BrandHeader";

export default function Home() {
  return (
    <div className="min-h-screen">
      <BrandHeader />

      {/* Form Section with ID for smooth scroll */}
      <div id="annual-report-form">
        <AnnualReportForm />
      </div>
    </div>
  );
}
