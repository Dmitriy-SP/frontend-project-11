import i18n from 'i18next';

const addClass = (el, attr) => (!el.classList.contains(attr) ? el.classList.add(attr) : null);
const removeClass = (el, attr) => (el.classList.contains(attr) ? el.classList.remove(attr) : null);

const renderFeedback = (state) => {
  const inputURL = document.querySelector('#url-input');
  const feedback = document.querySelector('p.feedback');

  switch (state.uiState.formStatus) {
    case 'add':
      inputURL.value = '';
      feedback.textContent = i18n.t('addURL');
      removeClass(feedback, 'text-danger');
      addClass(feedback, 'text-success');
      removeClass(inputURL, 'is-invalid');
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
  removeClass(feedback, 'text-success');
  addClass(feedback, 'text-danger');
  addClass(inputURL, 'is-invalid');
};

const watchedLink = (state, link) => !state.uiState.watchedLinks
  .every((stateLink) => stateLink !== link);

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
  state.feedList.forEach((feed) => {
    feeds = `${feeds}${buildFeedElement(feed)}`;
  });
  feedList.innerHTML = '';
  feedList.insertAdjacentHTML('afterbegin', feeds);

  document.querySelector('#postTitle').textContent = i18n.t('postTitle');
  let posts = '';
  state.postsList.forEach((post) => {
    posts = `${posts}${buildPostElement(state, post)}`;
  });
  postList.innerHTML = '';
  postList.insertAdjacentHTML('afterbegin', posts);
};

const render = (state) => {
  renderFeedback(state);
  if (state.postsList.length) {
    renderRSS(state);

    document.querySelectorAll('a.link')
      .forEach((link) => link.addEventListener('click', (e) => {
        state.uiState.watchedLinks.push(e.target.href);
        render(state);
      }));

    document.querySelectorAll('button.btn-sm')
      .forEach((button) => button.addEventListener('click', (e) => {
        e.preventDefault();
        const post = state.postsList[e.target.getAttribute('data-id') - 1];
        state.uiState.watchedLinks.push(post.link);
        document.querySelector('h5.modal-title').textContent = post.title;
        document.querySelector('div.modal-body').textContent = post.description;
        document.querySelector('a.full-article').href = post.link;
        render(state);
      }));
  }
};

export default render;
