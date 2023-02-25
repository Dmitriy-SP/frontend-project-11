import i18n from 'i18next';

const renderFeedback = (state) => {
  const inputURL = document.querySelector('#url-input');
  const feedback = document.querySelector('p.feedback');

  switch (state.uiState.formStatus) {
    case 'add':
      inputURL.value = '';
      feedback.textContent = i18n.t('addURL');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      inputURL.classList.remove('is-invalid');
      return;
    case 'networkError':
      feedback.textContent = i18n.t('networkError');
      break;
    case 'unvalid':
      feedback.textContent = i18n.t('unvalidURL');
      break;
    case 'added':
      feedback.textContent = i18n.t('addedURL');
      break;
    case 'noRSS':
      feedback.textContent = i18n.t('noRSS');
      break;
    case 'waiting':
      return;
    default:
      throw new Error('error in state.urlStatus - unavaillable status');
  }
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  inputURL.classList.add('is-invalid');
};

const watchedLink = (state, link) => !state.uiState.watchedPosts
  .every((post) => post.link !== link);

const getLinkClasses = (state, postData) => (watchedLink(state, postData.link) ? 'fw-normal link-secondary link' : 'fw-bold link');

const buildPostElement = (state, postData) => `<li class="list-group-item d-flex justify-content-between 
  align-items-start border-0 border-end-0">
  <a href="${postData.link}" class="${getLinkClasses(state, postData)}" data-id="${postData.postID}" target="_blank" rel="noopener noreferrer">${postData.title}</a>
  <button type="button" class="btn btn-outline-primary btn-sm"data-bs-toggle="modal" data-bs-target="#modal"  data-id="${postData.postID}">
  ${i18n.t('buttonText')}</button></li>`;

const buildFeedElement = (feedData) => `<li class="list-group-item border-0 border-end-0">
  <h3 class="h6 m-0">${feedData.title}</h3>
  <p class="m-0 small text-black-50">${feedData.description}</p>
  </li>`;

const renderRSS = (state) => {
  const feedList = document.querySelector('#feeds');
  const postList = document.querySelector('#posts');

  document.querySelector('#feedTitle').textContent = i18n.t('feedTitle');
  let feeds = '';
  state.feeds.forEach((feed) => {
    feeds = `${feeds}${buildFeedElement(feed)}`;
  });
  feedList.innerHTML = '';
  feedList.insertAdjacentHTML('afterbegin', feeds);

  document.querySelector('#postTitle').textContent = i18n.t('postTitle');
  let posts = '';
  state.posts.forEach((post) => {
    posts = `${posts}${buildPostElement(state, post)}`;
  });
  postList.innerHTML = '';
  postList.insertAdjacentHTML('afterbegin', posts);
};

const render = (state) => {
  renderFeedback(state);

  if (state.posts.length) {
    renderRSS(state);
  }

  if (state.uiState.modalPost) {
    document.querySelector('h5.modal-title').textContent = state.uiState.modalPost.title;
    document.querySelector('div.modal-body').textContent = state.uiState.modalPost.description;
    document.querySelector('a.full-article').href = state.uiState.modalPost.link;
  }
};

export default render;
