import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import locales from '../locales/index.js';
import request from './request.js';
import { renderFeedback, renderRSS } from './render.js';
import addID from './addid.js';
import time from './timeout.js';

const schema = yup.string().url();

const hasAdded = (state, newURL) => !state.feedList.every((feed) => feed.link !== newURL);

const runLocales = async (ru) => await i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

export const render = (state) => {
  renderRSS(state);

  document.querySelectorAll('a.link')
    .forEach((link) => link.addEventListener('click', (e) => {
      state.uiState.watchedLinks.push(e.target.href);
      render(state);
    }));

  document.querySelectorAll('button.btn-sm')
    .forEach((button) => button.addEventListener('click', (e) => {
      e.preventDefault();
      const post = state.postsList[e.target.getAttribute('data-id') - 1];
      state.uiState.watchedLinks.push(post.link);
      document.querySelector('h5.modal-title').textContent = post.title;
      document.querySelector('div.modal-body').textContent = post.description;
      document.querySelector('a.full-article').href = post.link;
      render(state);
  }));
};

export default (state) => {
  const form = document.querySelector('form');
  const inputURL = document.querySelector('#url-input');
  const watchedState = onChange(state, renderFeedback);

  runLocales(locales.ru);

  time(state);

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
                    return;
                  case 'rssError':
                    watchedState.uiState.formStatus = 'unvalid';
                    return;
                  default:
                    addID(state, data);
                    state.feedList.push(data.feed);
                    state.postsList = [...state.postsList, ...data.posts];
                    render(state);
                    watchedState.uiState.formStatus = 'add';
                }
              });
          }
        } else {
          watchedState.uiState.formStatus = 'unvalid';
        }
      });
  });
};
