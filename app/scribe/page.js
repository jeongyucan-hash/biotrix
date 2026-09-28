import HQShell from "../components/HQShell";
import ScribeWorkspace from "./ScribeWorkspace";

export const metadata = {
  title: "Scribe · BIOTRIX HQ",
  robots: { index: false, follow: false },
};

export default function ScribePage() {
  return (
    <HQShell active="Scribe" title="Scribe" eyebrow="CONTENT INTELLIGENCE">
      <ScribeWorkspace />
    </HQShell>
  );
}
