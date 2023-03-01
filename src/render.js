const renderError = (state, i18nInstance) => {
  const feedback = document.querySelector('p.feedback');
  switch (state.error) {
    case 'networkError':
      feedback.textContent = i18nInstance.t('networkError');
      break;
    case 'unvalid':
      feedback.textContent = i18nInstance.t('unvalidURL');
      break;
    case 'added':
      feedback.textContent = i18nInstance.t('addedURL');
      break;
    case 'noRSS':
      feedback.textContent = i18nInstance.t('noRSS');
      break;
    case null:
      return;
    default:
      throw new Error('error in state.error - unavaillable error');
  }
};

const renderFeedback = (state, i18nInstance) => {
  const inputURL = document.querySelector('#url-input');
  const feedback = document.querySelector('p.feedback');
  const button = document.querySelector('button.btn-primary');
  switch (state.formStatus) {
    case 'add':
      inputURL.value = '';
      feedback.textContent = i18nInstance.t('addURL');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      inputURL.classList.remove('is-invalid');
      button.removeAttribute('disabled');
      return;
    case 'failed':
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      inputURL.classList.add('is-invalid');
      button.removeAttribute('disabled');
      return;
    case 'loading':
      button.setAttribute('disabled', true);
      return;
    default:
      throw new Error('error in state.formStatus - unavaillable status');
  }
};

const isWatchedLink = (state, id) => !state.uiState.watchedPosts.every((postID) => postID !== id);

const getLinkClasses = (state, postData) => (isWatchedLink(state, postData.postID) ? 'fw-normal link-secondary' : 'fw-bold');

const buildPostElement = (state, postData, i18nInstance) => `<li class="list-group-item d-flex justify-content-between 
  align-items-start border-0 border-end-0">
  <a href="${postData.link}" class="${getLinkClasses(state, postData)}" data-id="${postData.postID}" target="_blank" rel="noopener noreferrer">${postData.title}</a>
  <button type="button" class="btn btn-outline-primary btn-sm"data-bs-toggle="modal" data-bs-target="#modal"  data-id="${postData.postID}">
  ${i18nInstance.t('buttonText')}</button></li>`;

const buildFeedElement = (feedData) => `<li class="list-group-item border-0 border-end-0">
  <h3 class="h6 m-0">${feedData.title}</h3>
  <p class="m-0 small text-black-50">${feedData.description}</p>
  </li>`;

const renderFeeds = (state, i18nInstance) => {
  const feedList = document.querySelector('#feeds');
  document.querySelector('#feedTitle').textContent = i18nInstance.t('feedTitle');
  let feeds = '';
  state.feeds.forEach((feed) => {
    feeds = `${feeds}${buildFeedElement(feed)}`;
  });
  feedList.innerHTML = '';
  feedList.insertAdjacentHTML('afterbegin', feeds);
};

const renderPosts = (state, i18nInstance) => {
  const postList = document.querySelector('#posts');
  document.querySelector('#postTitle').textContent = i18nInstance.t('postTitle');
  let posts = '';
  state.posts.forEach((post) => {
    posts = `${posts}${buildPostElement(state, post, i18nInstance)}`;
  });
  postList.innerHTML = '';
  postList.insertAdjacentHTML('afterbegin', posts);
};

const renderModalPost = (state) => {
  const post = state.posts
    .filter((statePost) => statePost.postID === state.uiState.modalPostID)[0];
  document.querySelector('h5.modal-title').textContent = post.title;
  document.querySelector('div.modal-body').textContent = post.description;
  document.querySelector('a.full-article').href = post.link;
};

export {
  renderFeedback,
  renderError,
  renderFeeds,
  renderPosts,
  renderModalPost,
};
