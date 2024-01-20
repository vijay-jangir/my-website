"use client";

import React from "react";
import SectionHeading from "./section-heading";
import Image from "next/image"
import { StaticImageData } from "next/image";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experiencesData } from "@/lib/data";
import { companyWebsiteMap } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import logo from "@/public/project_img/org-airtel.png"

export default function Experience() {
  const { ref } = useSectionInView("Experience");
  const { theme } = useTheme();
  const companyUrl = '';
  return (
    <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40">
      <SectionHeading>My experience</SectionHeading>
      <VerticalTimeline lineColor="">
        {experiencesData.map((item, index) => (
          <React.Fragment key={index}>
            <VerticalTimelineElement
              contentStyle={{
                background:
                  theme === "light" ? "#f3f4f6" : "rgba(255, 255, 255, 0.05)",
                boxShadow: "none",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                padding: "1.3rem 2rem",
              }}
              contentArrowStyle={{
                borderRight:
                  theme === "light"
                    ? "0.4rem solid #9ca3af"
                    : "0.4rem solid rgba(255, 255, 255, 0.5)",
              }}
              date={item.date}
              // icon={item.icon}
              icon={item.icon && React.isValidElement(item.icon)? 
                (
                  item.icon
                ) : (
                <div
                  style={{overflow: "hidden", borderRadius: "50%", maxHeight: "100%", maxWidth: "100%", display: "flex"}}
                >
                  <Image 
                    src={item.icon as StaticImageData}
                    alt={item.location} 
                  ></Image>
                </div>
              )}
              iconStyle={{
                background:
                  theme === "light" ? "white" : "rgba(255, 255, 255, 0.15)",
                fontSize: "1.5rem",
              }}
            >
              <h3 className="font-semibold capitalize">{item.title}</h3>
              {companyWebsiteMap[item.location as keyof typeof companyWebsiteMap] && (
                <a 
                href={companyWebsiteMap[item.location as keyof typeof companyWebsiteMap]}
                target="_blank"
                rel="noopener noreferrer"
                className="font-normal !mt-0"
                >
                  {item.location}
                </a>
              )}
              <p className="!mt-1 !font-normal text-gray-700 dark:text-white/75">
                {item.description}
              </p>
            </VerticalTimelineElement>
          </React.Fragment>
        ))}
      </VerticalTimeline>
    </section>
  );
}
