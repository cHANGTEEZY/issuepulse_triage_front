import type { CSSProperties } from "react";
import { AnimatedCounter } from "@/components/arc/animated-counter/animated-counter";
import SegmentBar from "@/components/_common/segment-bar";
import type { Company } from "@/features/home/data/companies";
import { companyHealth } from "@/features/home/lib/companies";

const WIN_STYLE = {
  "--text-3xl": "28px",
  "--tracking-display": "-0.03em",
  "--font-display": "inherit",
} as CSSProperties;

type PipelineHealthProps = {
  company: Company;
};

export default function PipelineHealth({ company }: PipelineHealthProps) {
  const health = companyHealth(company);
  const stages = [
    { label: "Discovery", value: health.discovery, tone: "danger" as const },
    { label: "Evaluation", value: health.evaluation, tone: "warning" as const },
    { label: "Procurement", value: health.procurement, tone: "success" as const },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span
          className="block leading-none font-semibold"
          style={WIN_STYLE}
        >
          <AnimatedCounter value={company.winProbability} suffix="%" />
        </span>
        <span className="caption-style block text-soft">
          Win probability across all open deals
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {stages.map((stage) => (
          <div key={stage.label} className="flex flex-col gap-2">
            <div className="caption-style flex items-center justify-between">
              <span>{stage.label}</span>
              <span>{stage.value}%</span>
            </div>
            <SegmentBar
              percent={stage.value}
              segments={63}
              tone={stage.tone}
              className="h-3 w-full border border-white/4 px-px"
              segmentClassName="h-2"
              trackClassName="bg-white/8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
