import axios from 'axios'
import type { BlogProp } from '../blog';

export default async function getWixBlogs() {
    let posts:  BlogProp[]
    try{
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
            'Authorization': process.env.WIX_API_KEY
          },
        }
      ); 
      posts = response.data.posts ?? []
      posts.map((post) => {post.blog_id = "wix"})
      console.error(posts[0])
    }
    catch (error) {
      console.error("Error while calling WIX api", error)
      posts = []
    }
   
    return posts
  }