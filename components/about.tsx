"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        Hello! 
        I am a  <span className="font-medium">Data Analytics</span> evangelist
        and dedicated data engineer with a passion 
        for transforming raw data into valuable insights.
        With expertise in data modeling, ETL processes, and data visualization,
        I thrive on streamlining complex workflows and uncovering hidden patterns.{" "}
      </p>

      <p className="mb-3">
        As a constant learner,
        I stay updated with the latest trends and technologies in the data analytics field.
        I believe collaboration is key to solving challenges,
        and I'm excited to connect with like-minded professionals and projects.
      </p>

      <p className="mb-3">
        Let's harness the power of data together and shape a smarter,
        data-driven future!
        If you're seeking a data engineer with a keen eye for detail and a commitment to excellence,
        I'm here to help you unlock the true potential of your data.
        Let's make a difference, one dataset at a time!
      </p>
    </motion.section>
  );
}
