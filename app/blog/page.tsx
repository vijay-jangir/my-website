import Blogs from "@/components/blogs";
import { motion } from "framer-motion";
import Example from "@/lib/wix"
export default function Home() {
  const ref="#blog"
  return (
    <main className="flex flex-col items-center px-4">
      {/* <Blogs /> */}
      <Example/>
    </main>
  );
}
