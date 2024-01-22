"use server"
import React from 'react';
import Blog from './blog';
import type { BlogProp } from './blog';
import getBlogs from "./providers"



// This function can be named anything

 
export default async function Blogs() {
  const blogs = await getBlogs()
  const displayBlog = blogs.map((blog:BlogProp) => (
    <React.Fragment key={blog.id}>
      <Blog {...blog} />
    </React.Fragment>
  ))

  return (
    // <SectionHeading>My Blogs</SectionHeading>
    // {blogs.length > 0 && (
    <>
      {blogs.length === 0 ? (
        <div className='sm:mb-[25%]'>
          <p>No blogs available. Check back later for updates!</p>
        </div>
      ) : (
        <div className="flex sm:mb-[2rem] flex-wrap flex-col justify-around gap-2 sm:gap-1 md:gap-1 lg:gap-1 xl:gap-1">
          {displayBlog}
        </div>
      )}
    </>


    // )}
    // {blogs.length === 0 && <p>No blogs found.</p>}

  )
}