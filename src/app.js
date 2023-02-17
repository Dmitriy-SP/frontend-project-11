import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import locales from './locales/index.js';
import render from './render.js';

const hasAdded = (state, newURL) => !state.feedList.every((feed) => feed.link !== newURL);

const hasPost = (state, newPost) => !state.postsList.every((post) => post.link !== newPost.link);

const addID = (state, data) => {
  const lastFeedID = state.feedList.length ? state.feedList[state.feedList.length - 1].id : 0;
  let lastPostID = state.postsList.length ? state.postsList[state.postsList.length - 1].postID : 0;
  data.feed.id = lastFeedID + 1;
  data.posts.forEach((post) => {
    post.postID = lastPostID + 1;
    lastPostID += 1;
    post.feedID = lastFeedID + 1;
  });
};

const parse = (response) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(response.data.contents, 'application/xml');
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

const request = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => {
    if (response.status !== 200) {
      throw new Error('networkError');
    }
    if (response.data.status.http_code !== 200) {
      throw new Error('rssError');
    }
    return parse(response);
  });

const watchingFeeds = (watchedState) => setTimeout(() => {
  watchedState.feedList.forEach((feed) => request(feed.link)
    .then((data) => {
      const newPosts = {
        feed,
        posts: data.posts.filter((post) => !hasPost(watchedState, post)),
      };
      if (newPosts.posts.length) {
        addID(watchedState, newPosts);
        watchedState.postsList = [...watchedState.postsList, ...newPosts.posts];
      }
    })
    .catch(() => {}));
  return watchingFeeds(watchedState);
}, 5000);

export default () => {
  const state = {
    feedList: [],
    postsList: [],
    uiState: {
      formStatus: 'waiting',
      watchedLinks: [],
      modalPostId: null,
    },
  };

  i18n.init({
    lng: 'ru',
    debug: true,
    resources:
      locales,
  })
    .then(() => {
      const form = document.querySelector('form');
      const inputURL = document.querySelector('#url-input');
      const postsField = document.querySelector('#posts');
      const schema = yup.string().url();

      const watchedState = onChange(state, (path, value) => render(state, value));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = inputURL.value;
        schema.validate(url)
          .then(() => {
            if (hasAdded(state, url)) {
              watchedState.uiState.formStatus = 'added';
              return;
            }
            request(url)
              .then((data) => {
                addID(state, data);
                state.feedList.push(data.feed);
                const newPosts = data.posts.filter((post) => !hasPost(state, post));
                state.postsList = [...state.postsList, ...newPosts];
                watchedState.uiState.formStatus = 'waiting';
                watchedState.uiState.formStatus = 'add';
              });
          })
          .catch((error) => {
            switch (error) {
              case 'networkError':
                watchedState.uiState.formStatus = 'networkError';
                break;
              case 'rssError':
                watchedState.uiState.formStatus = 'noRSS';
                break;
              default:
                watchedState.uiState.formStatus = 'unvalid';
            }
          });
      });

      postsField.addEventListener('click', (e) => {
        switch (e.target.localName) {
          case 'a':
            watchedState.uiState.watchedLinks.push(e.target.getAttribute('href'));
            break;
          case 'button': {
            const post = state.postsList[e.target.getAttribute('data-id') - 1];
            watchedState.uiState.watchedLinks.push(post.link);
            watchedState.uiState.modalPostId = post.postID;
            watchedState.uiState.modalPostId = null;
            break;
          }
          default:
        }
      });

      watchingFeeds(watchedState);
    });
};
