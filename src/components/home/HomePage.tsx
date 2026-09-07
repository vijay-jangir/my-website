import { MotionConfig, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import type {
  ExperienceDefinition,
  ProfileHighlight,
  ProjectDefinition,
  SiteProfile,
  SkillDefinition,
} from "@/lib/portfolio-types";
import HomePageHero from "@/src/components/home/HomePageHero";
import {
  ContactSection,
  ExperienceSection,
  WhyVijaySection,
} from "@/src/components/home/HomePageExperienceSections";
import {
  homeTechStackGroupDefinitions,
  ProcessSection,
  SelectedWorkSection,
  TechStackSection,
  type HomeTechStackGroup,
} from "@/src/components/home/HomePageProjectSections";

type Props = {
  readonly experiences: readonly ExperienceDefinition[];
  readonly featuredProjects: readonly ProjectDefinition[];
  readonly profileHighlights: readonly ProfileHighlight[];
  readonly siteProfile: SiteProfile;
  readonly skillDefinitions: readonly SkillDefinition[];
};

export default function HomePage({
  experiences,
  featuredProjects,
  profileHighlights,
  siteProfile,
  skillDefinitions,
}: Props) {
  useReducedMotion();

  const skillLabelById = useMemo(
    () =>
      Object.fromEntries(
        skillDefinitions.map((skill) => [skill.id, skill.label]),
      ) as Record<string, string>,
    [skillDefinitions],
  );

  const groupedTechStack = useMemo<readonly HomeTechStackGroup[]>(
    () =>
      homeTechStackGroupDefinitions
        .map((group) => ({
          title: group.title,
          skills: group.skillIds
            .map((skillId) =>
              skillDefinitions.find((skill) => skill.id === skillId),
            )
            .filter((skill): skill is SkillDefinition => Boolean(skill)),
        }))
        .filter((group) => group.skills.length > 0),
    [skillDefinitions],
  );

  return (
    <MotionConfig reducedMotion="user">
      <main className="pb-8">
        <HomePageHero
          profileHighlights={profileHighlights}
          siteProfile={siteProfile}
        />
        <SelectedWorkSection
          featuredProjects={featuredProjects.filter((project) => project.featured)}
          skillLabelById={skillLabelById}
        />
        <ProcessSection />
        <TechStackSection groups={groupedTechStack} />
        <ExperienceSection experiences={experiences.slice(0, 3)} />
        <WhyVijaySection />
        <ContactSection siteProfile={siteProfile} />
      </main>
    </MotionConfig>
  );
}
