import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import locales from './locales/index.js';
import request from './request.js';
import render from './render.js';
import addID, { hasAdded, hasPost } from './utils.js';
import watchingFeeds from './watchingFeeds.js';

const schema = yup.string().url();

const runLocales = (ru) => i18n.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
});

export default () => {
  const state = {
    feedList: [],
    postsList: [],
    uiState: {
      formStatus: 'waiting',
      watchedLinks: [],
    },
  };

  runLocales(locales.ru)
    .then(() => {
      const form = document.querySelector('form');
      const inputURL = document.querySelector('#url-input');

      const watchedState = onChange(state, (path, value) => {
        render(state, value);
        state.uiState.formStatus = 'waiting';
      });
      watchingFeeds(state);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = inputURL.value;
        schema.isValid(url)
          .then((valid) => {
            if (valid) {
              if (hasAdded(state, url)) {
                watchedState.uiState.formStatus = 'added';
              } else {
                request(url)
                  .then((data) => {
                    switch (data) {
                      case 'networkError':
                        watchedState.uiState.formStatus = 'networkError';
                        break;
                      case 'rssError':
                        watchedState.uiState.formStatus = 'unvalid';
                        break;
                      default: {
                        addID(state, data);
                        state.feedList.push(data.feed);
                        const newPosts = data.posts.filter((post) => !hasPost(state, post));
                        state.postsList = [...state.postsList, ...newPosts];
                        watchedState.uiState.formStatus = 'add';
                      }
                    }
                  });
              }
            } else {
              watchedState.uiState.formStatus = 'unvalid';
            }
          });
      });
    });
};
