import axios from 'axios'
import { motion } from 'framer-motion';
import SectionHeading from './section-heading';

type Blog = {
  id: string
  title: string
  excerpt: string
  url: BlogUrl
}

type BlogUrl = {
  base: string
  path: string
}

// This function can be named anything
async function getPosts() {
  const response = await axios.post(
    'https://www.wixapis.com/v3/posts/query',
    '{"fieldsets":["URL"]}',
    {
      headers: {
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, PATCH, DELETE',
        // 'Access-Control-Allow-Headers': "wix-site-id",
        'wix-site-id': 'e02544df-019e-47c2-9a69-ebffa6a06dbb',
        'Content-Type': 'application/json',
        'Authorization': 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjFlOTU3MDg1LTY2ZjUtNDJmNi04YmIzLTJjM2YzYzJkYzdiNlwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjFiMzU3MzJhLWQyMjMtNDU2MS1iZDQ1LWViOTJmZDFlMTk0YVwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJhYTYyOTFkMi03MWEyLTRkYjItYTEwYi1jNGE2NTdjZjc2M2NcIn19IiwiaWF0IjoxNzAzMzUzODY2fQ.Z8eY1F8Eo6t9vDx36T1_AeMWwh8ITy4sZjC3WqrGwuKf_yYqmxKeFisY-ZMDpPezWiePYCeBCSCVDYJXse9sqpWkMCCGlYk0HSgLM6v7MnBfgM8IIabLo_awvL_CqmlUsLiXBbpE4Q2FYozjqqYychsn7AEgt9AMt5S0R1hEwGOy8MTegm4dxFOY1wyAQ5iWZ3Rjy0I13f6xqTN9LRbEinJHp7225bYAtYbSE3rGFZAiOeE9Qc0M_WPYiBeHdV3w61H5qDmAn41U93Upw1sN6XKuTozCy8LVIsP97RHo6z8KBcFf0jU8bialYDzDdMxZIAXouldZqug_W9ZTtjKzdQ'
      },
    }
  ); 
  const posts = response.data.posts
 
  return posts
}
 
export default async function Blogs() {
  const blogs = await getPosts()

  console.log(blogs.length);
  return (
    // <SectionHeading>My Blogs</SectionHeading>
    // {blogs.length > 0 && (
      <ul>
        {blogs.map((blog: Blog) => (
          <li key={blog.id}>
            <h2>{blog.title}</h2>
            <p>{blog.excerpt}</p>
            <a href={blog.url.base+blog.url.path}>Read More</a>
          </li>
        ))}
      </ul>
    // )}
    // {blogs.length === 0 && <p>No blogs found.</p>}

  )
}