import watchForm from './view.js';

export default () => {
  const state = {
    addURL: '',
    status: 'standBy',
    feedList: [],
  };

  watchForm(state);
};
