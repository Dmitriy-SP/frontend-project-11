import request from './request.js';
import addID, { hasPost } from './utils.js';
import render from './render.js';

const watchingFeeds = (state) => setTimeout(() => {
  state.feedList.forEach((feed) => request(feed.link)
    .then((data) => {
      switch (data) {
        case 'networkError':
        case 'rssError':
          return;
        default: {
          const newPosts = {
            feed,
            posts: data.posts.filter((post) => !hasPost(state, post)),
          };
          if (newPosts.posts.length) {
            addID(state, newPosts);
            state.postsList = [...state.postsList, ...newPosts.posts];
            render(state);
          }
        }
      }
    }));
  return watchingFeeds(state);
}, 5000);

export default (state) => watchingFeeds(state);
