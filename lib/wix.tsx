import { createClient, OAuthStrategy } from '@wix/api-client';
import { items } from '@wix/data';
// import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { env } from 'process';

const myWixClient = createClient({
    modules: { items },
    auth: OAuthStrategy({
      clientId: process.env.WIX_SITE_ID || '',
      tokens: JSON.parse(Cookies.get('session') || '{}')
    })
  });

export default function Example() {
  // const [examples, setExamples] = useState([]);

  async function fetchExamples() {
    try {
      const examples = await myWixClient.items.queryDataItems({ dataCollectionId: 'my_website_blogs' }).ascending('orderId').find();      
    } catch (error) {
      console.log("error" + error)
    }
    console.log("test")
    // console.log(examples.items)
    // setExamples(examples.items);
  }
  const data = fetchExamples();
  // useEffect(() => { fetchExamples(); }, []);

  return (
    <div>
      {/* {examples.map((example) => (
        <a href={example.data.slug} key={example._id}>
          <h2>{example.data.title} <span>-&gt;</span></h2>
          <p>{example.data.description}</p>
        </a>
      ))} */}
      <h3>hello from wix</h3>
    </div>
  )
}