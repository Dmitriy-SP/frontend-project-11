import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import locales from './locales/index.js';
import request from './request.js';

const schema = yup.string().url();
const addClass = (el, attr) => (!el.classList.contains(attr) ? el.classList.add(attr) : null);
const removeClass = (el, attr) => (el.classList.contains(attr) ? el.classList.remove(attr) : null);
const hasAdded = (state, newURL) => !state.feedList.every((feed) => feed.link !== newURL);

const runLocales = async (ru) => await i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

const renderFeedback = (path, value) => {
  const inputURL = document.querySelector('#url-input');
  const feedback = document.querySelector('p.feedback');

  switch (value) {
    case 'networkError':
      feedback.textContent = i18n.t('networkError');
      removeClass(feedback, 'text-success');
      addClass(feedback, 'text-danger');
      addClass(inputURL, 'is-invalid');
      break;
    case 'unvalid':
      feedback.textContent = i18n.t('unvalidURL');
      removeClass(feedback, 'text-success');
      addClass(feedback, 'text-danger');
      addClass(inputURL, 'is-invalid');
      break;
    case 'add':
      feedback.textContent = i18n.t('addURL');
      removeClass(feedback, 'text-danger');
      addClass(feedback, 'text-success');
      removeClass(inputURL, 'is-invalid');
      break;
    case 'added':
      feedback.textContent = i18n.t('addedURL');
      removeClass(feedback, 'text-success');
      addClass(feedback, 'text-danger');
      addClass(inputURL, 'is-invalid');
      break;
    case 'noRSS':
      feedback.textContent = i18n.t('noRSS');
      removeClass(feedback, 'text-success');
      addClass(feedback, 'text-danger');
      addClass(inputURL, 'is-invalid');
      break;
    default:
      throw new Error('error in state.status - unavaillable status');
  }
};

const buildPostElement = (postData) => `<li class="list-group-item d-flex justify-content-between 
  align-items-start border-0 border-end-0">
  <a href="${postData.link}" class="fw-bold link" target="_blank" rel="noopener noreferrer">${postData.title}</a>
  <button type="button" class="btn btn-outline-primary btn-sm"data-bs-toggle="modal" data-bs-target="#modal">
  ${i18n.t('buttonText')}</button></li>`;

const buildFeedElement = (feedData) => `<li class="list-group-item border-0 border-end-0">
  <h3 class="h6 m-0">${feedData.title}</h3>
  <p class="m-0 small text-black-50">${feedData.description}</p>
  </li>`;

const findPost = (state, link) => state.postsList.filter((post) => post.link === link)[0];

const renderRSS = (state) => {
  const feedList = document.querySelector('#feeds');
  const postList = document.querySelector('#posts');

  document.querySelector('#feedTitle').textContent = i18n.t('feedTitle');
  let feeds = '';
  state.feedList.forEach((feed) => feeds = `${feeds}${buildFeedElement(feed)}`);
  feedList.innerHTML = '';
  feedList.insertAdjacentHTML('afterbegin',  feeds);

  document.querySelector('#postTitle').textContent = i18n.t('postTitle');
  let posts = '';
  state.postsList.forEach((post) => posts = `${posts}${buildPostElement(post)}`);
  postList.innerHTML = '';
  postList.insertAdjacentHTML('afterbegin', posts);

  document.querySelectorAll('a.link')
    .forEach((link) => link.addEventListener('click', (e) => {
      e.target.className = 'fw-normal link-secondary link';
    }));

  document.querySelectorAll('button.btn-sm')
    .forEach((button) => button.addEventListener('click', (e) => {
      e.preventDefault();
      const linkPost = e.target.previousSibling.previousSibling;
      linkPost.className = 'fw-normal link-secondary link';
      const post = findPost(state, linkPost.href);
      const title = document.querySelector('h5.modal-title');
      title.textContent = post.title;
      const description = document.querySelector('div.modal-body');
      description.textContent = post.description;
      const link = document.querySelector('a.full-article');
      link.href = post.link;
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
            watchedState.status = 'added';
          } else {
            request(url)
              .then((data) => {
                switch (data) {
                  case 'networkError':
                    watchedState.status = 'networkError';
                    return;
                  case 'rssError':
                    watchedState.status = 'unvalid';
                    return;
                  default:
                    state.feedList.push(data.feed);
                    state.postsList = [...state.postsList, ...data.posts];
                    renderRSS(state);
                    watchedState.status = 'add';
                }
              });
          }
        } else {
          watchedState.status = 'unvalid';
        }
      });
  });
};
