"use client";

import { useTranslations } from "next-intl";

const steps = [
  {
    number: 1,
    titleKey: "step1",
    descKey: "step1Desc",
  },
  {
    number: 2,
    titleKey: "step2",
    descKey: "step2Desc",
  },
  {
    number: 3,
    titleKey: "step3",
    descKey: "step3Desc",
  },
];

export function HowItWorks() {
  const t = useTranslations("common");

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t(step.titleKey)}
              </h3>
              <p className="text-gray-600 text-center max-w-xs">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




