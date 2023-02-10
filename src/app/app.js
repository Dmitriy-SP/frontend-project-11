import i18n from 'i18next';
import buildView from './view.js';

import locales from '../locales/index.js';

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
      formStatus: '',
      watchedLinks: [],
    },
  };

  runLocales(locales.ru)
    .then(() => {
      buildView(state);
    });
};
