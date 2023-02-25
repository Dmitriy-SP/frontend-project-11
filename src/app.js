import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import locales from './locales/index.js';
import render from './render.js';
import parse from './parser.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('https://allorigins.hexlet.app/get');
  urlWithProxy.searchParams.append('disableCache', 'true');
  urlWithProxy.searchParams.append('url', url);
  return urlWithProxy;
};

const buildData = (response, currentFeedID) => {
  const data = parse(response.data.contents);
  const feedID = currentFeedID ?? _.uniqueId();
  data.feed.id = feedID;
  data.feed.link = response.data.status.url;
  data.posts.map((post) => _.extend(post, { feedID, postID: _.uniqueId() }));
  return data;
};

const loadData = (url, watchedState) => axios.get(addProxy(url))
  .then((response) => {
    const data = buildData(response);
    watchedState.posts = [...watchedState.posts, ...data.posts];
    watchedState.feeds.push(data.feed);
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
  const promises = watchedState.feeds.map((feed) => new Promise((resolve) => {
    axios.get(addProxy(feed.link))
      .then((response) => {
        const data = buildData(response, feed.id);
        const addedFeedPosts = watchedState.posts.filter((post) => post.feedID === feed.id);
        const newPosts = data.posts.filter((post) => addedFeedPosts
          .every((addedPost) => addedPost.link !== post.link));
        if (newPosts.length) {
          watchedState.posts = [...watchedState.posts, ...newPosts];
        }
        resolve(true);
      })
      .catch(() => {});
  }));

  Promise.all(promises).then(() => updateData(watchedState));
}, 5000);

export default () => {
  const state = {
    feeds: [],
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

      const schema = yup.lazy(() => yup.string('unvalid').notOneOf([state.feeds.map((feed) => feed.link)], 'added').url('unvalid'));

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
