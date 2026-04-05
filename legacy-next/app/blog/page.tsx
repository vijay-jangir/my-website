import Blogs from "@/components/blogs";

export const metadata = {
  title: "Blog | Vijay Jangir",
  description:
    "Writing on data engineering, platforms, analytics, and systems.",
};

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <section className="mb-12 max-w-[48rem] text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Writing</h1>
        <p className="mt-4 text-gray-700 dark:text-white/70">
          Notes on data engineering, platform work, analytics, and systems that
          I&apos;ve found useful in real projects.
        </p>
      </section>
      <Blogs />
    </main>
  );
}
