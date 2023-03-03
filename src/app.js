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

const loadData = (url, watchedState) => {
  watchedState.formStatus = 'loading';
  axios.get(addProxy(url))
    .then((response) => {
      const data = parse(response.data.contents);
      data.feed.id = _.uniqueId();
      data.feed.link = url;
      data.posts.map((post) => _.extend(post, { feedID: data.feed.id, postID: _.uniqueId() }));
      watchedState.posts = [...data.posts, ...watchedState.posts];
      watchedState.feeds = [data.feed, ...watchedState.feeds];
      watchedState.formStatus = 'add';
      watchedState.error = null;
    })
    .catch((error) => {
      watchedState.formStatus = 'failed';
      if (error.isAxiosError) {
        watchedState.error = 'networkError';
        return;
      }
      if (error.isParsingError) {
        watchedState.error = 'noRSS';
        return;
      }
      watchedState.error = 'unknownError';
    });
};

const updateData = (watchedState) => setTimeout(() => {
  const promises = watchedState.feeds.map((feed) => axios.get(addProxy(feed.link))
    .then((response) => {
      const data = parse(response.data.contents);
      const addedFeedPosts = watchedState.posts.filter((post) => post.feedID === feed.id);
      const newPosts = data.posts.filter((post) => addedFeedPosts
        .every((addedPost) => addedPost.link !== post.link));
      if (newPosts.length) {
        newPosts.map((post) => _.extend(post, { feedID: feed.id, postID: _.uniqueId() }));
        watchedState.posts = [...newPosts, ...watchedState.posts];
      }
    })
    .catch(() => {}));

  Promise.all(promises).finally(() => updateData(watchedState));
}, 5000);

const validate = (url, addedURLs) => {
  const schema = yup.string('unvalid').notOneOf(addedURLs, 'added').url('unvalid');
  return schema.validate(url);
};

export default () => {
  const initialState = {
    feeds: [],
    posts: [],
    formStatus: 'waiting',
    error: null,
    uiState: {
      watchedPosts: [],
      modalPostID: null,
    },
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources:
      locales,
  })
    .then(() => {
      const form = document.querySelector('form');
      const postsField = document.querySelector('#posts');

      const watchedState = onChange(
        initialState,
        (path) => render(path, watchedState, i18nInstance),
      );

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');

        validate(url, watchedState.feeds.map((feed) => feed.link))
          .then(() => loadData(url, watchedState))
          .catch((error) => {
            watchedState.formStatus = 'failed';
            switch (error.message) {
              case 'unvalid':
                watchedState.error = 'unvalid';
                break;
              case 'added':
                watchedState.error = 'added';
                break;
              default:
                watchedState.error = 'unknownError';
            }
          });
      });

      postsField.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (id) {
          if (watchedState.uiState.watchedPosts.every((watchedPost) => watchedPost.postID !== id)) {
            watchedState.uiState.watchedPosts.push(id);
          }
          watchedState.uiState.modalPostID = id;
        }
      });

      updateData(watchedState);
    });
};
