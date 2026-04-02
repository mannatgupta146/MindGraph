const tweetUrl = 'https://twitter.com/X/status/1815104443916292312';
const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}`;

fetch(oembedUrl)
  .then(res => res.json())
  .then(data => {
    console.log('HTML:', data.html);
    console.log('Author Name:', data.author_name);
  })
  .catch(err => console.error('Fetch failed:', err));
