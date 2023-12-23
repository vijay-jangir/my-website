import Blogs from "@/components/blogs";
import { motion } from "framer-motion";

export default function Home() {
  const ref="#blog"
  return (
    <main className="flex flex-col items-center px-4">
      <Blogs />
    </main>
  );
}
