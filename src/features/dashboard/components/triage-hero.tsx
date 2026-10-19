import { Nest } from "@/lib/hairline/figures";
import HairlineFigure from "@/components/_common/hairline-figure";
import Button from "@/components/_ui/button";

type TriageHeroProps = {
  untriaged: number;
  highPriority: number;
  repositories: number;
  onTriage: () => void;
};

function plural(count: number, one: string, other: string) {
  return `${count} ${count === 1 ? one : other}`;
}

export default function TriageHero({
  untriaged,
  highPriority,
  repositories,
  onTriage,
}: TriageHeroProps) {
  const clear = untriaged === 0;

  return (
    <section className="border-border bg-card grid min-w-0 items-center gap-2 overflow-hidden rounded-xl border p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,15em)] lg:grid-cols-[minmax(0,1fr)_minmax(0,19em)] lg:px-8 lg:py-6">
      <div className="flex min-w-0 flex-col items-start gap-3">
        <p className="caption-style text-subtle">Triage inbox</p>
        <h2 className="max-w-[18em] text-balance">
          {clear
            ? "Every issue has been triaged"
            : `${plural(untriaged, "issue is", "issues are")} waiting for triage`}
        </h2>
        <p className="text-subtle max-w-[28em] text-pretty">
          {clear
            ? `Nothing is waiting across ${plural(repositories, "repository", "repositories")}. New issues land here as soon as they sync.`
            : `Across ${plural(repositories, "repository", "repositories")}, with ${plural(highPriority, "high-priority issue", "high-priority issues")} still open.`}
        </p>
        {!clear && (
          <Button variant="primary" size="md" className="mt-2" onClick={onTriage}>
            Start triaging
          </Button>
        )}
      </div>
      <HairlineFigure
        figure={Nest}
        surface="card"
        play
        intensity={0.6}
        label="A nest holding the issues waiting for triage"
        className="mx-auto max-w-[16em] sm:-my-4 sm:max-w-none"
      />
    </section>
  );
}
