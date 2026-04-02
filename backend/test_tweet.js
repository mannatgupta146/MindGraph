const tweetUrl = 'https://twitter.com/elonmusk/status/1815104443916292312';
const tweetId = tweetUrl.split('/').pop();
const infoUrl = `https://syndication.twitter.com/srv/tweet-info?id=${tweetId}`;

fetch(infoUrl)
  .then(res => res.json())
  .then(data => {
    console.log('Tweet Text:', data.text);
    console.log('User:', data.user.screen_name);
  })
  .catch(err => console.error('Fetch failed:', err));
