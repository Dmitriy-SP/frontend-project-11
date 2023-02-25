const parse = (rawData) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rawData, 'application/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }

  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;

  const posts = [];
  data.querySelectorAll('item')
    .forEach((item) => {
      const link = item.querySelector('link').textContent;
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      posts.push({
        title,
        description,
        link,
      });
    });

  return {
    feed: {
      title: feedTitle,
      description: feedDescription,
    },
    posts,
  };
};

export default parse;
