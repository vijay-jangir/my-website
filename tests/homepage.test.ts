import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import HomePage from "@/src/components/home/HomePage";

function renderHomePage() {
  return renderToStaticMarkup(
    createElement(HomePage, {
      experiences: fallbackPortfolioSnapshot.experiences,
      featuredProjects: fallbackPortfolioSnapshot.projects.filter(
        (project) => project.featured,
      ),
      profileHighlights: fallbackPortfolioSnapshot.profileHighlights,
      siteProfile: fallbackPortfolioSnapshot.siteProfile,
      skillDefinitions: fallbackPortfolioSnapshot.skillDefinitions,
    }),
  );
}

describe("HomePage", () => {
  it("renders the process, tech stack, and differentiator sections", () => {
    const markup = renderHomePage();

    expect(markup).toContain("How I work");
    expect(markup).toContain("Discovery");
    expect(markup).toContain("Architecture");
    expect(markup).toContain("Development");
    expect(markup).toContain("Delivery");
    expect(markup).toContain("Evolution");
    expect(markup).toContain("Tech stack");
    expect(markup).toContain("AI &amp; LLM");
    expect(markup).toContain("Why Vijay");
    expect(markup).toContain(
      "12+ years across telecom, retail, and enterprise data — not just demos",
    );
  });

  it("uses inviting contact copy instead of the limiting version", () => {
    const markup = renderHomePage();

    expect(markup).toContain("Let’s build data infrastructure that works.");
    expect(markup).not.toContain(
      "I am most useful where data systems need clearer ownership",
    );
  });

  it("pulls visible tech labels from the portfolio skill definitions", () => {
    const markup = renderHomePage();

    expect(markup).toContain("Python");
    expect(markup).toContain("LangGraph");
    expect(markup).toContain("Kafka");
    expect(markup).toContain("Postgres");
    expect(markup).toContain("Cloud (GCP, AWS, Azure)");
  });
});
