"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";

import { siteProfile } from "@/content/portfolio";
import { useActiveSectionContext } from "@/context/active-section-context";
import { useSectionInView } from "@/lib/hooks";
import { getHighlightedFocuses } from "@/lib/portfolio";

const highlightedFocuses = getHighlightedFocuses().slice(0, 5);

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  return (
    <section
      ref={ref}
      id="home"
      className="mb-24 max-w-[62rem] text-center sm:mb-0 scroll-mt-[100rem]"
    >
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0 }}
            transition={{
              type: "tween",
              duration: 0.2,
            }}
          >
            <Image
              alt="Vijay Jangir"
              className="h-34 w-34 rounded-full border-[0.35rem] border-white object-cover shadow-xl"
              height="192"
              priority
              quality={95}
              src="/profile-pic.jpeg"
              width="192"
            />
          </motion.div>
        </div>
      </div>

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-gray-500"
        initial={{ opacity: 0, y: 60 }}
      >
        {siteProfile.title}
      </motion.p>

      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-5 max-w-4xl px-4 text-3xl font-semibold leading-[1.2] sm:text-5xl"
        initial={{ opacity: 0, y: 80 }}
      >
        {siteProfile.heroLabel}
      </motion.h1>

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-6 max-w-3xl px-4 text-base leading-7 text-gray-700 dark:text-white/75"
        initial={{ opacity: 0, y: 80 }}
        transition={{
          delay: 0.05,
        }}
      >
        {siteProfile.recruiterPitch}
      </motion.p>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex flex-wrap justify-center gap-3 px-4"
        initial={{ opacity: 0, y: 80 }}
        transition={{
          delay: 0.08,
        }}
      >
        {highlightedFocuses.map((focus) => (
          <Link
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/10"
            href={`/resume?focus=${focus.id}`}
            key={focus.id}
          >
            {focus.shortLabel}
          </Link>
        ))}
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 flex flex-col items-center justify-center gap-3 px-4 text-lg font-medium sm:flex-row"
        initial={{ opacity: 0, y: 100 }}
        transition={{
          delay: 0.12,
        }}
      >
        <Link
          className="group flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3 text-white outline-none transition hover:scale-105 hover:bg-gray-950 focus:scale-105 active:scale-100"
          href="#contact"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now());
          }}
        >
          Contact me
          <BsArrowRight className="opacity-70 transition group-hover:translate-x-1" />
        </Link>

        <Link
          className="group flex items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3 outline-none transition hover:scale-105 hover:border-black/20 hover:bg-black/5 focus:scale-105 active:scale-100 dark:border-white/10 dark:bg-white/10"
          href="/resume"
        >
          Tailored resume
          <HiDownload className="opacity-60 transition group-hover:translate-y-1" />
        </Link>

        <Link
          className="rounded-full border border-black/10 px-7 py-3 text-base outline-none transition hover:scale-105 hover:border-black/20 hover:bg-black/5 focus:scale-105 active:scale-100 dark:border-white/10 dark:hover:bg-white/10"
          href="/work"
        >
          Selected work
        </Link>

        <div className="flex flex-row gap-3">
          <a
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white p-4 text-gray-700 transition hover:scale-[1.1] hover:text-gray-950 focus:scale-[1.1] active:scale-100 dark:border-white/10 dark:bg-white/10 dark:text-white/60"
            href={siteProfile.linkedinUrl}
            rel="noreferrer"
            target="_blank"
          >
            <BsLinkedin />
          </a>

          <a
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white p-4 text-[1.35rem] text-gray-700 transition hover:scale-[1.1] hover:text-gray-950 focus:scale-[1.1] active:scale-100 dark:border-white/10 dark:bg-white/10 dark:text-white/60"
            href={siteProfile.githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            <FaGithubSquare />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
