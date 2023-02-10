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
          addID(state, data);
          const newPosts = data.posts.filter((post) => !hasPost(state, post));
          state.postsList = [...state.postsList, ...newPosts];
          render(state);
        }
      }
    }));
  return watchingFeeds(state);
}, 5000);

export default (state) => watchingFeeds(state);
