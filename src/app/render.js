import i18n from 'i18next';

const addClass = (el, attr) => (!el.classList.contains(attr) ? el.classList.add(attr) : null);
const removeClass = (el, attr) => (el.classList.contains(attr) ? el.classList.remove(attr) : null);

export const renderFeedback = (path, value) => {
    const inputURL = document.querySelector('#url-input');
    const feedback = document.querySelector('p.feedback');
  
    switch (value) {
      case 'add':
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
      default:
        throw new Error('error in state.urlStatus - unavaillable status');
        return;
    }
    removeClass(feedback, 'text-success');
    addClass(feedback, 'text-danger');
    addClass(inputURL, 'is-invalid');
};

const getLinkClasses = (postData) => postData.watched ? 'fw-normal link-secondary link' : 'fw-bold link';

const buildPostElement = (postData) => `<li class="list-group-item d-flex justify-content-between 
  align-items-start border-0 border-end-0">
  <a href="${postData.link}" class="${getLinkClasses(postData)}" target="_blank" rel="noopener noreferrer">${postData.title}</a>
  <button type="button" class="btn btn-outline-primary btn-sm"data-bs-toggle="modal" data-bs-target="#modal">
  ${i18n.t('buttonText')}</button></li>`;

const buildFeedElement = (feedData) => `<li class="list-group-item border-0 border-end-0">
  <h3 class="h6 m-0">${feedData.title}</h3>
  <p class="m-0 small text-black-50">${feedData.description}</p>
  </li>`;

export const renderRSS = (state) => {
  const feedList = document.querySelector('#feeds');
  const postList = document.querySelector('#posts');

  document.querySelector('#feedTitle').textContent = i18n.t('feedTitle');
  let feeds = '';
  state.feedList.forEach((feed) => feeds = `${feeds}${buildFeedElement(feed)}`);
  feedList.innerHTML = '';
  feedList.insertAdjacentHTML('afterbegin',  feeds);

  document.querySelector('#postTitle').textContent = i18n.t('postTitle');
  let posts = '';
  state.postsList.forEach((post) => posts = `${posts}${buildPostElement(post)}`);
  postList.innerHTML = '';
  postList.insertAdjacentHTML('afterbegin', posts);
};