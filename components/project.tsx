"use client";

import { useRef } from "react";
import { projectsData } from "@/lib/data";
import Image, { StaticImageData } from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

type ProjectProps = {
  title: string;
  description: string;
  tags: readonly string[];
  imageUrl?: StaticImageData; // Make imageUrl optional
};

export default function Project({
  title,
  description,
  tags,
  imageUrl,
}: ProjectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgess = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgess = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  // const divClass = "pt-4 pb-7 px-5 sm:pl-10 sm:pr-2 sm:pt-10 flex flex-col h-full sm:max-w-[70%] sm:ml-[9rem]"
  // const imageConditionalClass = imageUrl ? ' sm:max-w-[50%] sm:group-even:ml-[18rem]' : '';
  // const tagConditionalClass = tags ? '' : '';
  return (
    <motion.div
      ref={ref}
      style={{
        scale: scaleProgess,
        opacity: opacityProgess,
      }}
      className=" mb-3 sm:mb-8 last:mb-0"
    >
      <section className="bg-gray-100 max-w-[38rem] h-full border border-black/5 rounded-lg overflow-hidden sm:pr-4 sm:pl-4 relative sm:min-h-[10rem] hover:bg-gray-200 transition dark:text-white dark:bg-white/10 dark:hover:bg-white/20">
        <h3 className="text-xl font-semibold text-center sm:pt-1 border-b">{title}</h3>
        <div className="pb-0 sm:pr-0 flex flex-row h-full" >
          <div className="flex sm:max-w-[30%] rounded-t-lg h-full">
            <ul className="flex flex-wrap mt-2 gap-2 sm:pb-0 sm:mr-auto sm:mb-auto">
              {tags.map((tag, index) => (
                <li
                  className="bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white rounded-full dark:text-white/70"
                  key={index}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex sm:max-w-[70%] sm:ml-[1rem] h-full ">
            <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
              {description}
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
