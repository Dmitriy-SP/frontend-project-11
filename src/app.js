import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import locales from './locales/index.js';
import render from './render.js';
import parse from './parser.js';

const addProxy = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const buildData = (response, currentFeedID) => {
  const data = parse(response.data.contents, 'application/xml');
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  const feedID = currentFeedID ?? _.uniqueId();

  const items = [];
  data.querySelectorAll('item')
    .forEach((item) => {
      const link = item.querySelector('link').textContent;
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      items.push({
        title,
        description,
        link,
        feedID,
        postID: _.uniqueId(),
      });
    });

  return {
    feed: {
      title: feedTitle,
      description: feedDescription,
      link: response.data.status.url,
      id: feedID,
    },
    posts: items,
  };
};

const loadData = (url, watchedState) => axios.get(addProxy(url))
  .then((response) => {
    const data = buildData(response);
    watchedState.posts = [...watchedState.posts, ...data.posts];
    watchedState.feeds.push(data.feed);
    watchedState.feedLinks.push(data.feed.link);
    watchedState.uiState.formStatus = 'waiting';
    watchedState.uiState.formStatus = 'add';
  })
  .catch((error) => {
    if (error.isAxiosError) {
      throw new Error('networkError');
    }
    if (error.isParsingError) {
      throw new Error('noRSS');
    }
    throw new Error('unknownError');
  });

const updateData = (watchedState) => setTimeout(() => {
  watchedState.feeds.forEach((feed) => axios.get(addProxy(feed.link))
    .then((response) => {
      const data = buildData(response, feed.id);
      const addedFeedPosts = watchedState.posts.filter((post) => post.feedID === feed.id);
      const newPosts = data.posts.filter((post) => addedFeedPosts
        .every((addedPost) => addedPost.link !== post.link));
      if (newPosts.posts.length) {
        watchedState.posts = [...watchedState.posts, ...newPosts];
      }
    })
    .then(() => updateData(watchedState))
    .catch((error) => {
      if (error.isAxiosError) {
        throw new Error('networkError');
      }
      if (error.isParsingError) {
        throw new Error('noRSS');
      }
      throw new Error('unknownError');
    }));
}, 5000);

export default () => {
  const state = {
    feeds: [],
    feedLinks: [],
    posts: [],
    uiState: {
      formStatus: 'waiting',
      watchedPosts: [],
      modalPost: {},
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
      const postsField = document.querySelector('#posts');

      const schema = yup.string('unvalid').notOneOf([state.feedLinks], 'added').url('unvalid');

      const watchedState = onChange(state, (path, value) => render(state, value));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        schema.validate(url)
          .then(() => loadData(url, watchedState, state))
          .catch((error) => {
            switch (error.message) {
              case 'unvalid':
                watchedState.uiState.formStatus = 'unvalid';
                break;
              case 'added':
                watchedState.uiState.formStatus = 'added';
                break;
              case 'networkError':
                watchedState.uiState.formStatus = 'networkError';
                break;
              case 'noRSS':
                watchedState.uiState.formStatus = 'noRSS';
                break;
              case 'unknownError':
                watchedState.uiState.formStatus = 'unknownError';
                break;
              default:
            }
          });
      });

      postsField.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const post = state.posts.filter((statePost) => statePost.postID === id)[0];
        watchedState.uiState.watchedPosts.push(post);
        watchedState.uiState.modalPost = post;
      });

      updateData(watchedState);
    });
};
