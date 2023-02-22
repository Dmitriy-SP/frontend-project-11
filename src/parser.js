const parse = (rawData) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rawData, 'application/xml');
  if (data.querySelector('parsererror')) {
    throw new Error('parsingError');
  }
  return data;
};

export default (response) => {
  const data = parse(response.data.contents, 'application/xml');
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;

  const items = [];
  data.querySelectorAll('item')
    .forEach((item) => {
      const link = item.querySelector('link').textContent;
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      items.push({ title, description, link });
    });
  return {
    feed: { title: feedTitle, description: feedDescription, link: response.data.status.url },
    posts: items,
  };
};
