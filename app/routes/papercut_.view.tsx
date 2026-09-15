import { createFileRoute } from "@tanstack/react-router";
import { PaperCutView } from "~/components/papercut/PaperCutView";

export const Route = createFileRoute("/papercut_/view")({
  head: () => ({
    meta: [
      { title: "Paper Cut Showcase | 100mini" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: PaperCutView,
});
