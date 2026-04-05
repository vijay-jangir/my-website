import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { siteProfile } from "@/content/portfolio";
import type { ResumeVariant } from "@/lib/portfolio-types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 3,
  },
  headline: {
    fontSize: 12,
    marginBottom: 4,
  },
  meta: {
    fontSize: 9,
    color: "#4b5563",
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  paragraph: {
    marginBottom: 6,
  },
  listItem: {
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  companyTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 2,
  },
  companyMeta: {
    color: "#4b5563",
    marginBottom: 4,
  },
  skillBlock: {
    marginBottom: 5,
  },
  skillLabel: {
    fontWeight: 700,
  },
});

type AtsResumeDocumentProps = {
  variant: ResumeVariant;
};

export default function AtsResumeDocument({
  variant,
}: AtsResumeDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{siteProfile.name}</Text>
          <Text style={styles.headline}>{variant.headline}</Text>
          <Text style={styles.meta}>
            {siteProfile.email} | {siteProfile.location} | {siteProfile.githubUrl} |
            {" "}
            {siteProfile.linkedinUrl}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.paragraph}>{variant.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {variant.highlights.map((highlight) => (
            <Text key={highlight.id} style={styles.listItem}>
              {highlight.label}: {highlight.value} - {highlight.detail}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.skillBlock}>
            <Text style={styles.skillLabel}>Primary: </Text>
            {variant.primarySkills.map((skill) => skill.label).join(", ")}
          </Text>
          <Text style={styles.skillBlock}>
            <Text style={styles.skillLabel}>Secondary: </Text>
            {variant.secondarySkills.map((skill) => skill.label).join(", ")}
          </Text>
          <Text>
            <Text style={styles.skillLabel}>Supporting: </Text>
            {variant.supportingSkills.map((skill) => skill.label).join(", ")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Work</Text>
          {variant.projects.map((project) => (
            <View key={project.id} style={styles.listItem}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text>{project.summary}</Text>
              <Text>{project.impact}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {variant.experiences.map((experience) => (
            <View key={experience.id} style={styles.listItem}>
              <Text style={styles.companyTitle}>
                {experience.title} | {experience.company}
              </Text>
              <Text style={styles.companyMeta}>{experience.date}</Text>
              <Text style={styles.paragraph}>{experience.description}</Text>
              {experience.bullets.map((bullet) => (
                <Text key={bullet.id} style={styles.listItem}>
                  • {bullet.text}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
