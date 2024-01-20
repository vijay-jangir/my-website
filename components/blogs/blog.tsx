"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type BlogUrl = {
    base: string
    path: string
  };
  
export  type BlogProp = {
    blog_id?: string
    id: string
    title: string
    excerpt: string
    url: BlogUrl
};
  
export default function Blog({
  blog_id,
  // id,
  title,
  excerpt,
  url,
}: BlogProp) {
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
    <a 
      href={url.base + url.path}
      target="_blank"
      rel="noopener noreferrer"
      className="font-normal !mt-0"
      >

        <section className="bg-gray-100 h-full border border-black/5 rounded-lg overflow-hidden sm:pr-4 sm:pl-4 relative sm:min-h-[7rem] hover:bg-gray-200 transition dark:text-white dark:bg-white/10 dark:hover:bg-white/20">
          {blog_id && (
            <div className="absolute left-0 top-0 h-16 w-16">
              <div
                className="absolute transform -rotate-45 bg-gray-600 bg-opacity-40 text-center text-white font-semibold py-1 left-[-50px] top-[30px] w-[170px]">
                {blog_id}
              </div>
            </div>       
          )}
              <h3 className="text-xl font-semibold text-center sm:pt-1 border-b">{title}</h3>

          <div className="pb-0 sm:pr-0 flex flex-row h-full max-w-[75%] ml-[15%]" >
            <div className="flex flex-row sm:ml-[1rem] h-full ">
              <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
                {excerpt}
              </p>
            </div>
          </div>
        </section>
      </a>
    </motion.div>
  );
}
