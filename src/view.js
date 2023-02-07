import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import locales from './locales/index.js';

const schema = yup.string().url();
const addClass = (el, attr) => (!el.classList.contains(attr) ? el.classList.add(attr) : null);
const removeClass = (el, attr) => (el.classList.contains(attr) ? el.classList.remove(attr) : null);
const hasAdded = (state, newURL) => state.feedList.includes(newURL);

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
    case 'standBy':
      feedback.textContent = '';
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
            state.feedList.push(url);
            watchedState.status = 'add';
          }
        } else {
          watchedState.status = 'unvalid';
        }
      });
  });
};
