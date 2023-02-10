import watchForm from './view.js';

export default () => {
  const state = {
    feedList: [],
    postsList: [],
    uiState: {
      formStatus: '',
      watchedLinks: [],
    },
  };

  watchForm(state);
};
