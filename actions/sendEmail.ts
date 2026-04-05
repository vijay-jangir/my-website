"use server";

import React from "react";
import { Resend } from "resend";

import ContactFormEmail from "@/email/contact-form-email";
import { env, isEmailConfigured } from "@/lib/env";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getErrorMessage, validateString } from "@/lib/utils";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export const sendEmail = async (formData: FormData) => {
  const senderEmail = formData.get("senderEmail");
  const message = formData.get("message");
  const turnstileToken = formData.get("cf-turnstile-response");

  if (!validateString(senderEmail, 500)) {
    return {
      error: "Invalid sender email.",
    };
  }
  if (!validateString(message, 5000)) {
    return {
      error: "Invalid message.",
    };
  }

  const turnstileOk = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
  );

  if (!turnstileOk) {
    return {
      error: "Turnstile verification failed. Please retry.",
    };
  }

  if (!isEmailConfigured() || !resend) {
    return {
      error: "Email delivery is not configured yet. Please use direct email instead.",
    };
  }

  try {
    const data = await resend.emails.send({
      from: env.resendFrom,
      to: env.contactToEmail,
      subject: "Message from contact form",
      reply_to: senderEmail,
      react: React.createElement(ContactFormEmail, {
        message,
        senderEmail,
      }),
    });

    return {
      data,
    };
  } catch (error: unknown) {
    return {
      error: getErrorMessage(error),
    };
  }
};
