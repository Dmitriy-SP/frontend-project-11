const renderError = (state, elements, i18nInstance) => {
  switch (state.error) {
    case 'networkError':
      elements.feedback.textContent = i18nInstance.t('networkError');
      break;
    case 'unvalid':
      elements.feedback.textContent = i18nInstance.t('unvalidURL');
      break;
    case 'added':
      elements.feedback.textContent = i18nInstance.t('addedURL');
      break;
    case 'noRSS':
      elements.feedback.textContent = i18nInstance.t('noRSS');
      break;
    case null:
      return;
    default:
      throw new Error('error in state.error - unavaillable error');
  }
};

const renderFeedback = (state, elements, i18nInstance) => {
  switch (state.formStatus) {
    case 'add':
      elements.inputURL.value = '';
      elements.feedback.textContent = i18nInstance.t('addURL');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.inputURL.classList.remove('is-invalid');
      elements.feedbackButton.removeAttribute('disabled');
      return;
    case 'failed':
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.inputURL.classList.add('is-invalid');
      elements.feedbackButton.removeAttribute('disabled');
      return;
    case 'loading':
      elements.feedbackButton.setAttribute('disabled', true);
      return;
    default:
      throw new Error('error in state.formStatus - unavaillable status');
  }
};

const isWatchedLink = (state, id) => state.uiState.watchedPosts.includes(id);

const buildPostElement = (state, postData, i18nInstance) => {
  const post = document.createElement('li');
  post.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';
  const link = document.createElement('a');
  link.className = (isWatchedLink(state, postData.postID) ? 'fw-normal link-secondary' : 'fw-bold');
  link.href = postData.link;
  link.textContent = postData.title;
  link.setAttribute('data-id', postData.postID);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  const button = document.createElement('p');
  button.setAttribute('type', 'button');
  button.className = 'btn btn-outline-primary btn-sm';
  button.textContent = i18nInstance.t('buttonText');
  button.setAttribute('data-id', postData.postID);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  post.appendChild(link);
  post.appendChild(button);
  return post;
};

const buildFeedElement = (feedData) => {
  const feed = document.createElement('li');
  feed.className = 'list-group-item border-0 border-end-0';
  const feedHeader = document.createElement('h3');
  feedHeader.className = 'h6 m-0';
  feedHeader.textContent = feedData.title;
  const feedText = document.createElement('p');
  feedText.className = 'm-0 small text-black-50';
  feedText.textContent = feedData.description;
  feed.appendChild(feedHeader);
  feed.appendChild(feedText);
  return feed;
};

const renderFeeds = (state, elements, i18nInstance) => {
  elements.textContent = i18nInstance.t('feedTitle');
  const fragment = document.createDocumentFragment();
  state.feeds.forEach((feed) => {
    fragment.appendChild(buildFeedElement(feed));
  });
  elements.feedList.innerHTML = '';
  elements.feedList.appendChild(fragment);
};

const renderPosts = (state, elements, i18nInstance) => {
  elements.textContent = i18nInstance.t('postTitle');
  const fragment = document.createDocumentFragment();
  state.posts.forEach((post) => {
    fragment.appendChild(buildPostElement(state, post, i18nInstance));
  });
  elements.postList.innerHTML = '';
  elements.postList.appendChild(fragment);
};

const renderModalPost = (state, elements) => {
  const post = state.posts
    .filter((statePost) => statePost.postID === state.uiState.modalPostID)[0];
  elements.modal.title.textContent = post.title;
  elements.modal.text.textContent = post.description;
  elements.modal.link.href = post.link;
};

export default (path, watchedState, elements, i18nInstance) => {
  switch (path) {
    case 'formStatus':
      renderFeedback(watchedState, elements, i18nInstance);
      break;
    case 'error':
      renderError(watchedState, elements, i18nInstance);
      break;
    case 'posts':
    case 'uiState.watchedPosts':
      renderPosts(watchedState, elements, i18nInstance);
      break;
    case 'feeds':
      renderFeeds(watchedState, elements, i18nInstance);
      break;
    case 'uiState.modalPostID':
      renderModalPost(watchedState, elements);
      break;
    default:
  }
};
