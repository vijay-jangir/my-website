"use client";

import React from "react";
import { motion } from "framer-motion";

import SectionHeading from "./section-heading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.03 * index,
    },
  }),
};

export default function Skills() {
  const { ref } = useSectionInView("Skills");

  return (
    <section
      className="mb-28 max-w-[56rem] scroll-mt-28 text-center sm:mb-40"
      id="skills"
      ref={ref}
    >
      <SectionHeading>Skills in rotation</SectionHeading>
      <p className="-mt-6 text-sm leading-6 text-gray-700 dark:text-white/70">
        These are the tools and systems I can bring forward or push into
        supporting context depending on the role.
      </p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-800">
        {skillsData.map((skill, index) => (
          <motion.li
            className="rounded-full border border-black/10 bg-white px-4 py-2 font-medium dark:border-white/10 dark:bg-white/10 dark:text-white/80"
            custom={index}
            initial="initial"
            key={skill}
            variants={fadeInAnimationVariants}
            viewport={{
              once: true,
            }}
            whileInView="animate"
          >
            {skill}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
