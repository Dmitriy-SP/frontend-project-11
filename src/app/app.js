import watchForm from './view.js';

export default () => {
  const state = {
    urlStatus: '',
    feedList: [],
    postsList: [],
  };

  watchForm(state);
};
