import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { IdPhotoWorkbench } from "~/components/idphoto/IdPhotoWorkbench";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/idphoto")({
  head: () => ({
    meta: [
      { title: i18n.t("idphoto.title") },
      { name: "description", content: i18n.t("idphoto.desc") },
      { name: "keywords", content: i18n.t("idphoto.keywords") },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: i18n.t("idphoto.heading") },
      { property: "og:description", content: i18n.t("idphoto.desc") },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: i18n.t("idphoto.heading") },
      { name: "twitter:description", content: i18n.t("idphoto.desc") },
    ],
  }),
  component: IdPhotoPage,
});

function IdPhotoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-[#006c49] py-10 dark:bg-[#0b1c30]">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1
              data-testid="idphoto-heading"
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              {i18n.t("idphoto.heading")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {i18n.t("idphoto.subheading")}
            </p>
          </div>
        </section>
        <IdPhotoWorkbench />
      </main>
      <AppFooter />
    </div>
  );
}
