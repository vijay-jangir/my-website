"use client";

import React from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { sendEmail } from "@/actions/sendEmail";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "./section-heading";
import SubmitBtn from "./submit-btn";
import TurnstileWidget from "./turnstile-widget";

type ContactProps = {
  contactEnabled: boolean;
  turnstileSiteKey?: string;
};

export default function Contact({
  contactEnabled,
  turnstileSiteKey,
}: ContactProps) {
  const { ref } = useSectionInView("Contact");

  return (
    <motion.section
      className="mb-20 w-[min(100%,42rem)] text-center sm:mb-28"
      id="contact"
      initial={{
        opacity: 0,
      }}
      ref={ref}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
      whileInView={{
        opacity: 1,
      }}
    >
      <SectionHeading>Contact me</SectionHeading>

      <p className="mx-auto -mt-6 max-w-2xl text-gray-700 dark:text-white/80">
        Email me directly at{" "}
        <a className="underline" href="mailto:contact@vijayjangir.com">
          contact@vijayjangir.com
        </a>
        . The form below works when email delivery is configured; otherwise the
        site falls back to direct email without pretending the form is live.
      </p>

      {!contactEnabled ? (
        <div className="mt-10 rounded-[1.75rem] border border-black/10 bg-white p-6 text-left shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm leading-6 text-gray-700 dark:text-white/75">
            Contact delivery is currently running in zero-cost fallback mode.
            Send email directly and I will reply from there.
          </p>
        </div>
      ) : (
        <form
          action={async (formData) => {
            const { data, error } = await sendEmail(formData);

            if (error) {
              toast.error(error);
              return;
            }

            if (data) {
              toast.success("Email sent successfully.");
            }
          }}
          className="mt-10 flex flex-col dark:text-black"
        >
          <input
            className="h-14 rounded-2xl border border-black/10 px-4 transition-all dark:bg-white dark:bg-opacity-80 dark:outline-none dark:focus:bg-opacity-100"
            maxLength={500}
            name="senderEmail"
            placeholder="Your email"
            required
            type="email"
          />
          <textarea
            className="my-3 h-52 rounded-2xl border border-black/10 p-4 transition-all dark:bg-white dark:bg-opacity-80 dark:outline-none dark:focus:bg-opacity-100"
            maxLength={5000}
            name="message"
            placeholder="Your message"
            required
          />
          <TurnstileWidget siteKey={turnstileSiteKey} />
          <SubmitBtn />
        </form>
      )}
    </motion.section>
  );
}
