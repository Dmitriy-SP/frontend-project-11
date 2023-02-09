import watchForm from './view.js';

export default () => {
  const state = {
    addURL: '',
    status: '',
    feedList: [],
    postsList: [],
  };

  watchForm(state);
};
