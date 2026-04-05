"use client";

import React from "react";
import { motion } from "framer-motion";

import SectionHeading from "./section-heading";
import { siteProfile } from "@/content/portfolio";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mb-28 max-w-[48rem] scroll-mt-28 text-center leading-8 sm:mb-40"
      id="about"
      initial={{ opacity: 0, y: 100 }}
      ref={ref}
      transition={{ delay: 0.175 }}
    >
      <SectionHeading>About me</SectionHeading>
      {siteProfile.overview.map((paragraph) => (
        <p className="mb-4" key={paragraph}>
          {paragraph}
        </p>
      ))}
    </motion.section>
  );
}
