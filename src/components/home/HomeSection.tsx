import type { ReactNode } from "react";

type Props = {
  readonly children: ReactNode;
  readonly copy: string;
  readonly eyebrow: string;
  readonly id: string;
  readonly title: string;
};

export default function HomeSection({
  children,
  copy,
  eyebrow,
  id,
  title,
}: Props) {
  return (
    <section className="mx-auto max-w-[76rem] px-4 py-20" id={id}>
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#1f3b73]">
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-[15ch] text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#0e1528] sm:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          {copy}
        </p>
      </div>
      {children}
    </section>
  );
}
