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

const loadData = (url, watchedState) => axios.get(addProxy(url))
  .then((response) => {
    const data = parse(response.data.contents);
    data.feed.id = _.uniqueId();
    data.feed.link = url;
    data.posts.map((post) => _.extend(post, { feedID: data.feed.id, postID: _.uniqueId() }));
    watchedState.posts = [...watchedState.posts, ...data.posts];
    watchedState.feeds.push(data.feed);
    watchedState.uiState.formStatus = 'add';
    watchedState.error = 'none';
  })
  .catch((error) => {
    if (error.isAxiosError) {
      watchedState.uiState.formStatus = 'failed';
      watchedState.error = 'networkError';
      return;
    }
    if (error.isParsingError) {
      watchedState.uiState.formStatus = 'failed';
      watchedState.error = 'noRSS';
      return;
    }
    watchedState.uiState.formStatus = 'failed';
    watchedState.error = 'unknownError';
  });

const updateData = (watchedState) => setTimeout(() => {
  const promises = watchedState.feeds.map((feed) => axios.get(addProxy(feed.link))
    .then((response) => {
      const data = parse(response.data.contents);
      const addedFeedPosts = watchedState.posts.filter((post) => post.feedID === feed.id);
      const newPosts = data.posts.filter((post) => addedFeedPosts
        .every((addedPost) => addedPost.link !== post.link));
      if (newPosts.length) {
        newPosts.map((post) => _.extend(post, { feedID: feed.id, postID: _.uniqueId() }));
        watchedState.posts = [...watchedState.posts, ...newPosts];
      }
    })
    .catch(() => {}));

  Promise.all(promises).finally(() => updateData(watchedState));
}, 5000);

export default () => {
  const initialState = {
    feeds: [],
    posts: [],
    uiState: {
      formStatus: 'waiting',
      watchedPosts: [],
      modalPost: {},
    },
    error: 'none',
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

      const watchedState = onChange(initialState, (path, value) => render(initialState, value));

      const schema = yup.lazy(() => yup.string('unvalid').notOneOf([watchedState.feeds.map((feed) => feed.link)], 'added').url('unvalid'));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        schema.validate(url)
          .then(() => loadData(url, watchedState))
          .catch((error) => {
            switch (error.message) {
              case 'unvalid':
                watchedState.uiState.formStatus = 'failed';
                watchedState.error = 'unvalid';
                break;
              case 'added':
                watchedState.uiState.formStatus = 'failed';
                watchedState.error = 'added';
                break;
              default:
                throw new Error('error in schema.validate - unavaillable error');
            }
          });
      });

      postsField.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (id) {
          const post = watchedState.posts.filter((statePost) => statePost.postID === id)[0];
          watchedState.uiState.watchedPosts.push(post);
          watchedState.uiState.modalPost = post;
        }
      });

      updateData(watchedState);
    });
};
