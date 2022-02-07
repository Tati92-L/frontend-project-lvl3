/* eslint-disable quote-props */
import onChange from 'on-change';
import getMessage from './getMessage.js';

const feedsRender = (state) => {
  const feedUl = document.createElement('ul');
  const divFeeds = document.querySelector('.div-feeds');
  if (!document.querySelector('.title-feeds h2')) {
    const titleFeeds = document.querySelector('.title-feeds');
    const feedName = document.createElement('h2');
    feedName.classList.add('card-title');
    feedName.textContent = 'Фиды';

    titleFeeds.append(feedName);
  }
  feedUl.classList.add('list-group');
  state.forEach(({ feedHeader, feedInfo }) => {
    const feedLi = document.createElement('li');
    feedLi.classList.add('list-group-item');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feedHeader;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feedInfo;
    feedLi.append(feedTitle);
    feedLi.append(feedDescription);
    feedUl.append(feedLi);
    divFeeds.append(feedUl);
  });
};

const postsRender = (state) => {
  const postsList = document.createElement('ul');
  const divPosts = document.querySelector('.div-posts');
  if (!document.querySelector('.title-posts h2')) {
    const titlePosts = document.querySelector('.title-posts');
    const postsName = document.createElement('h2');
    postsName.classList.add('card-title');
    postsName.textContent = 'Посты';

    titlePosts.append(postsName);
  }

  postsList.classList.add('list-group');
  state.forEach(({ postTitle, postLink }) => {
    const postLi = document.createElement('li');
    postLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const postHref = document.createElement('a');
    postHref.setAttribute('href', postLink);
    postHref.setAttribute('rel', 'noopener noreferrer');
    postHref.setAttribute('target', '_blank');
    postHref.classList.add('fw-bold', 'link-main');
    postHref.textContent = postTitle;
    const postButton = document.createElement('button');
    postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postButton.setAttribute('type', 'button');
    postButton.setAttribute('type', 'button');
    postButton.textContent = 'Просмотр';
    postLi.append(postHref);
    postLi.append(postButton);
    postsList.append(postLi);

    divPosts.append(postsList);
  });
};

const handleErrors = (error) => {
  const inputEl = document.getElementById('url-input');
  inputEl.classList.remove('is-invalid');
  if (error) {
    inputEl.classList.add('is-invalid');
  }
  inputEl.focus();
};

const handleFeedback = ({ processState, key }) => {
  const cardEl = document.querySelector('.card-main');
  let pEl;
  if (!document.querySelector('.feedback')) {
    pEl = document.createElement('p');
    pEl.classList.add('feedback');
  } else {
    pEl = document.querySelector('.feedback');
    pEl.removeAttribute('class');
  }
  switch (processState) {
    case 'sent':
      handleErrors(false);
      pEl.classList.add('text-success', 'feedback');
      break;
    case 'error':
      handleErrors(true);
      pEl.classList.add('text-danger', 'feedback');
      break;
    default:
      throw new Error('Неизвестная ошибка');
  }
  pEl.textContent = getMessage(key);
  cardEl.append(pEl);
};

const onChangeState = (state) => onChange(state, (path, value) => {
  console.log('--: ', path, value);
  if (path === 'registrationForm') {
    handleFeedback({ processState: value.processState, key: value.mesagges });
  } else if (path === 'rssData.feeds') {
    feedsRender(value);
  } else if (path === 'rssData.postItems') {
    postsRender(value);
  }
});

export default onChangeState;
