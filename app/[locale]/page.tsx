import { useTranslations } from "next-intl";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PopularServices } from "@/components/home/PopularServices";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Categories />
      <HowItWorks />
      <PopularServices />
    </div>
  );
}




