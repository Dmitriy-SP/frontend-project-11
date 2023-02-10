import axios from 'axios';

const parse = (response) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(response.data.contents, "application/xml");
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;

  const items = [];
  data.querySelectorAll('item')
    .forEach((item) => {
      const link = item.querySelector('link').textContent;
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      items.push({ link, title, description, watched: false });
    });
  return { 
    feed: { title: feedTitle, description: feedDescription, link: response.data.status.url},
    posts: items
  };
};

export default (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => {
    if (response.status !== 200) {
      return 'networkError';
    }
    if (response.data.status.http_code !== 200) {
      return 'rssError';
    }
    return parse(response);
  });
