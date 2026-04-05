import { experiences, portfolioLinks, projects, skillDefinitions } from "@/content/portfolio";

export const links = portfolioLinks;

export const companyWebsiteMap = Object.fromEntries(
  experiences.map((experience) => [experience.company, experience.companyUrl]),
);

export const experiencesData = experiences.map((experience) => ({
  title: experience.title,
  location: experience.company,
  type: experience.type,
  description: experience.description,
  icon: experience.icon,
  date: experience.date,
}));

export const projectsData = projects.map((project) => ({
  title: project.title,
  description: project.summary,
  tags: project.skillIds.map((skillId) => skillDefinitions.find((skill) => skill.id === skillId)?.label ?? skillId),
}));

export const skillsData = skillDefinitions.map((skill) => skill.label);
