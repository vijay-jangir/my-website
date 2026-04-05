"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";

import { useActiveSectionContext } from "@/context/active-section-context";
import { links } from "@/lib/data";

export default function Header() {
  const pathname = usePathname();
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();

  return (
    <header className="relative z-50">
      <motion.div
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        className="fixed left-1/2 top-0 z-50 h-[5.25rem] w-full rounded-none border border-white border-opacity-40 bg-white bg-opacity-80 shadow-lg shadow-black/[0.03] backdrop-blur-[0.5rem] sm:top-6 sm:h-[3.7rem] sm:w-[52rem] sm:rounded-full dark:border-black/40 dark:bg-gray-950 dark:bg-opacity-75"
        initial={{ y: -100, x: "-50%", opacity: 0 }}
      />

      <nav className="fixed left-1/2 top-[0.2rem] z-50 flex h-[4.5rem] -translate-x-1/2 py-2 sm:top-[1.45rem] sm:h-[initial] sm:py-0">
        <ul className="flex w-[23rem] flex-wrap items-center justify-center gap-y-1 text-[0.86rem] font-medium text-gray-500 sm:w-[48rem] sm:flex-nowrap sm:gap-3">
          {links.map((link) => {
            const isRouteLink = !link.hash.includes("#");
            const isActiveRoute = isRouteLink && pathname === link.hash;
            const isActiveHomeSection =
              !isRouteLink && pathname === "/" && activeSection === link.name;

            return (
              <motion.li
                animate={{ y: 0, opacity: 1 }}
                className="relative flex h-3/4 items-center justify-center"
                initial={{ y: -100, opacity: 0 }}
                key={link.hash}
              >
                <Link
                  className={clsx(
                    "flex w-full items-center justify-center px-3 py-3 transition hover:text-gray-950 dark:text-gray-500 dark:hover:text-gray-300",
                    {
                      "text-gray-950 dark:text-gray-200":
                        isActiveRoute || isActiveHomeSection,
                    },
                  )}
                  href={link.hash}
                  onClick={() => {
                    setActiveSection(link.name);
                    setTimeOfLastClick(Date.now());
                  }}
                >
                  {link.name}

                  {(isActiveRoute || isActiveHomeSection) && (
                    <motion.span
                      className="absolute inset-0 -z-10 rounded-full bg-gray-100 dark:bg-gray-800"
                      layoutId="activeSection"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
