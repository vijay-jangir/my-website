import { env, isTurnstileConfigured } from "@/lib/env";

export async function verifyTurnstileToken(token: string | null) {
  if (!isTurnstileConfigured()) {
    return true;
  }

  if (!token) {
    return false;
  }

  const formData = new FormData();
  formData.set("secret", env.turnstileSecretKey as string);
  formData.set("response", token);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as {
    success?: boolean;
  };

  return Boolean(payload.success);
}
