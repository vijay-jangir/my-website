"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type ProjectProps = {
  title: string;
  description: string;
  tags: string[];
};

export default function Project({
  title,
  description,
  tags,
}: ProjectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.15 1"],
  });
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.65, 1]);

  return (
    <motion.div
      className="mb-4 h-full"
      ref={ref}
      style={{
        scale: scaleProgress,
        opacity: opacityProgress,
      }}
    >
      <section className="flex h-full max-w-[24rem] flex-col rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-4 flex-1 text-sm leading-6 text-gray-700 dark:text-white/70">
          {description}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              className="rounded-full bg-gray-100 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-gray-700 dark:bg-white/10 dark:text-white/75"
              key={tag}
            >
              {tag}
            </li>
          ))}
        </ul>
      </section>
    </motion.div>
  );
}
