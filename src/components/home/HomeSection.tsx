import type { ReactNode } from "react";

type Props = {
  readonly children: ReactNode;
  readonly copy: string;
  readonly eyebrow: string;
  readonly fullBleed?: string;
  readonly id: string;
  readonly title: string;
};

export default function HomeSection({
  children,
  copy,
  eyebrow,
  fullBleed,
  id,
  title,
}: Props) {
  const inner = (
    <div className={fullBleed ? "mx-auto max-w-[76rem] px-4" : undefined}>
      <div className="mx-auto max-w-4xl text-center">
        <p
          className={`font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${fullBleed ? "text-white/55" : "text-[#1f3b73]"}`}
        >
          {eyebrow}
        </p>
        <h2
          className={`mx-auto mt-4 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl ${fullBleed ? "text-white" : "text-[#0e1528]"}`}
        >
          {title}
        </h2>
        <p
          className={`mx-auto mt-6 max-w-2xl text-base leading-8 sm:text-lg ${fullBleed ? "text-white/72" : "text-slate-600"}`}
        >
          {copy}
        </p>
      </div>
      {children}
    </div>
  );

  if (fullBleed) {
    return (
      <section className={`full-bleed-breakout py-20 ${fullBleed}`} id={id}>
        {inner}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[76rem] px-4 py-20" id={id}>
      {inner}
    </section>
  );
}
