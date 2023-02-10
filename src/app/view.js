import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import locales from '../locales/index.js';
import request from './request.js';
import { renderFeedback, renderRSS } from './render.js';

const schema = yup.string().url();

const hasAdded = (state, newURL) => !state.feedList.every((feed) => feed.link !== newURL);

const getPostByLink = (state, link) => state.postsList.filter((post) => post.link === link)[0];

const runLocales = async (ru) => await i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

const render = (state) => {
  renderRSS(state);

  document.querySelectorAll('a.link')
    .forEach((link) => link.addEventListener('click', (e) => {
      getPostByLink(state, e.target.href).watched = true;
      render(state);
    }));

  document.querySelectorAll('button.btn-sm')
    .forEach((button) => button.addEventListener('click', (e) => {
      e.preventDefault();
      const linkPost = e.target.previousSibling.previousSibling;
      const post = getPostByLink(state, linkPost.href);
      post.watched = true;
      const title = document.querySelector('h5.modal-title');
      title.textContent = post.title;
      const description = document.querySelector('div.modal-body');
      description.textContent = post.description;
      const link = document.querySelector('a.full-article');
      link.href = post.link;
      render(state);
  }));
};

export default (state) => {
  const form = document.querySelector('form');
  const inputURL = document.querySelector('#url-input');
  const watchedState = onChange(state, renderFeedback);

  runLocales(locales.ru);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = inputURL.value;
    schema.isValid(url)
      .then((valid) => {
        if (valid) {
          if (hasAdded(state, url)) {
            watchedState.urlStatus = 'added';
          } else {
            request(url)
              .then((data) => {
                switch (data) {
                  case 'networkError':
                    watchedState.urlStatus = 'networkError';
                    return;
                  case 'rssError':
                    watchedState.urlStatus = 'unvalid';
                    return;
                  default:
                    state.feedList.push(data.feed);
                    state.postsList = [...state.postsList, ...data.posts];
                    render(state);
                    watchedState.urlStatus = 'add';
                }
              });
          }
        } else {
          watchedState.urlStatus = 'unvalid';
        }
      });
  });
};
