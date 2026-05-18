"use client";

import React from "react";
import Image, { type StaticImageData } from "next/image";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

import SectionHeading from "../section-heading";
import { experiences } from "@/content/portfolio";
import { useTheme } from "@/context/theme-context";
import { useSectionInView } from "@/lib/hooks";

export default function Experience() {
  const { ref } = useSectionInView("Experience");
  const { theme } = useTheme();

  return (
    <section className="mb-28 scroll-mt-28 sm:mb-40" id="experience" ref={ref}>
      <SectionHeading>Experience</SectionHeading>
      <VerticalTimeline lineColor="">
        {experiences.map((item) => (
          <React.Fragment key={item.id}>
            <VerticalTimelineElement
              contentArrowStyle={{
                borderRight:
                  theme === "light"
                    ? "0.4rem solid #9ca3af"
                    : "0.4rem solid rgba(255, 255, 255, 0.5)",
              }}
              contentStyle={{
                background:
                  theme === "light" ? "#f3f4f6" : "rgba(255, 255, 255, 0.05)",
                boxShadow: "none",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                padding: "1.4rem 2rem",
              }}
              date={item.date}
              icon={
                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: "50%",
                    maxHeight: "100%",
                    maxWidth: "100%",
                    display: "flex",
                  }}
                >
                  <Image
                    alt={item.company}
                    src={item.icon as StaticImageData}
                  />
                </div>
              }
              iconStyle={{
                background:
                  theme === "light" ? "white" : "rgba(255, 255, 255, 0.15)",
                fontSize: "1.5rem",
              }}
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold capitalize">{item.title}</h3>
                <a
                  className="text-sm font-medium underline-offset-4 hover:underline"
                  href={item.companyUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.company}
                </a>
                <p className="text-sm leading-6 text-gray-700 dark:text-white/75">
                  {item.description}
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-gray-700 dark:text-white/70">
                  {item.bullets.slice(0, 2).map((bullet) => (
                    <li key={bullet.id}>• {bullet.text}</li>
                  ))}
                </ul>
              </div>
            </VerticalTimelineElement>
          </React.Fragment>
        ))}
      </VerticalTimeline>
    </section>
  );
}
