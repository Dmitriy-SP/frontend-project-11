import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import locales from './locales/index.js';
import render from './render.js';
import parse from './parser.js';

const hasPost = (state, newPost) => !state.postsList.every((post) => post.link !== newPost.link);

const addProxy = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const addID = (state, data) => {
  const lastFeedID = state.feedList.length ? state.feedList[state.feedList.length - 1].id : 0;
  let lastPostID = state.postsList.length ? state.postsList[state.postsList.length - 1].postID : 0;
  data.feed.id = lastFeedID + 1;
  data.posts.forEach((post) => {
    post.postID = lastPostID + 1;
    lastPostID += 1;
    post.feedID = lastFeedID + 1;
  });
};

const loadData = (url, watchedState, state) => axios.get(addProxy(url))
  .then((response) => parse(response))
  .then((data) => {
    addID(state, data);
    state.feedList.push(data.feed);
    const newPosts = data.posts.filter((post) => !hasPost(state, post));
    state.postsList = [...state.postsList, ...newPosts];
    watchedState.uiState.formStatus = 'waiting';
    watchedState.uiState.formStatus = 'add';
  })
  .catch((error) => {
    if (error.request) {
      throw new Error('networkError');
    }
    throw new Error('noRSS');
  });

const updateData = (watchedState) => setTimeout(() => {
  watchedState.feedList.forEach((feed) => axios.get(addProxy(feed))
    .then((response) => parse(response))
    .then((data) => {
      const newPosts = {
        feed,
        posts: data.posts.filter((post) => !hasPost(watchedState, post)),
      };
      if (newPosts.posts.length) {
        addID(watchedState, newPosts);
        watchedState.postsList = [...watchedState.postsList, ...newPosts.posts];
      }
    })
    .catch(() => {}));
  return updateData(watchedState);
}, 5000);

export default () => {
  const state = {
    feedList: [],
    postsList: [],
    uiState: {
      formStatus: 'waiting',
      watchedPosts: [],
      modalPostId: null,
    },
  };

  i18n.init({
    lng: 'ru',
    debug: true,
    resources:
      locales,
  })
    .then(() => {
      const form = document.querySelector('form');
      const postsField = document.querySelector('#posts');

      const schema = yup.string('unvalid').url('unvalid').test(
        'unique',
        'added',
        (value) => state.feedList.every((feed) => feed.link !== value),
      );

      const watchedState = onChange(state, (path, value) => render(state, value));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { url } = Object.fromEntries(formData);
        schema.validate(url)
          .then(() => loadData(url, watchedState, state))
          .catch((error) => {
            switch (error.message) {
              case 'unvalid':
                watchedState.uiState.formStatus = 'unvalid';
                break;
              case 'added':
                watchedState.uiState.formStatus = 'added';
                break;
              case 'networkError':
                watchedState.uiState.formStatus = 'networkError';
                break;
              case 'noRSS':
                watchedState.uiState.formStatus = 'noRSS';
                break;
              default:
            }
          });
      });

      postsField.addEventListener('click', (e) => {
        const post = state.postsList[e.target.getAttribute('data-id') - 1];
        watchedState.uiState.watchedPosts.push(post);
        watchedState.uiState.modalPostId = post.postID;
      });

      updateData(watchedState);
    });
};
