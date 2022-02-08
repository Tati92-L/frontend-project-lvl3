import { setLocale, object, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parsingFunc from './parser.js';
import onChangeState from './view.js';

const state = {
  registrationForm: {
    mesagges: null,
    processState: 'filling',
  },
  results: [],
  rssData: {
    feeds: [],
    postItems: [],
  },
  popup: {},
};
const watchedState = onChangeState(state);

// const postsDif = (oldPosts, newPosts) => {
//   const tryDiff = _.difference(newPosts, oldPosts);
//   const changes = newPosts
//     .filter((newPost) => oldPosts
//       .filter((oldPost) => !_.isEqual(oldPost, newPost)));
//   console.log('c&d', tryDiff, '\nc \n', changes);
//   return changes;
// };

const getProxyUrl = (url) => {
  const corsProxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  corsProxyUrl.searchParams.set('disableCache', 'true');
  corsProxyUrl.searchParams.set('url', url);
  return corsProxyUrl.toString();
};

const linkButtons = () => {
  const modalButton = document.querySelectorAll('.btn-outline-primary');
  modalButton.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const { id } = e.target.dataset;
      const post = state.rssData.postItems[id];
      watchedState.popup = post;
      const modalBody = document.querySelector('.min-vh-100');
      modalBody.classList.add('modal-open');
      modalBody.setAttribute('style', 'overflow: hidden; padding-right: 0px');
      const modalPopup = document.querySelector('.fade');
      modalPopup.classList.add('show');
      modalPopup.removeAttribute('style');
      modalPopup.setAttribute('style', 'display: block');
      modalPopup.removeAttribute('aria-hidden');
      modalPopup.setAttribute('aria-modal', 'true');
      modalPopup.setAttribute('role', 'dialog');
      button.previousSibling.classList.remove('fw-bold', 'fw-main');
      button.previousSibling.classList.add('fw-normal', 'fw-secondary');
      const closeButtons = document.querySelectorAll('.btn-closeInfo');
      closeButtons.forEach((buttonClose) => {
        buttonClose.addEventListener('click', () => {
          modalBody.classList.remove('modal-open');
          modalBody.removeAttribute('style');
          modalBody.setAttribute('style', '""');
          modalPopup.classList.add('show');
          modalPopup.removeAttribute('style');
          modalPopup.setAttribute('style', 'display: none');
          modalPopup.removeAttribute('aria-modal');
          modalPopup.setAttribute('aria-hidden', 'true');
          modalPopup.removeAttribute('role');
        });
      });
    });
  });
};

const rssGetter = (link) => {
  axios
    .get(getProxyUrl(link))
    .then((response) => {
      if (response.status === 200) return response.data;
      throw new Error('Ошибка сервера');
    })
    .then((data) => {
      const { contents } = data;
      return parsingFunc(contents);
    })
    .then((rssData) => {
      const curData = state.rssData;
      const oldPosts = curData.postItems;
      const newPosts = rssData.postItems;
      const oldFeeds = curData.feeds;
      const newFeeds = rssData.feeds;
      console.log(rssData, _.isEqual(rssData, curData));

      if (!_.isEqual(oldPosts, newPosts)) {
        const posts = _.difference(newPosts, oldPosts);
        watchedState.rssData.postItems = posts;
        linkButtons();
      }
      if (!_.isEqual(oldFeeds, newFeeds)) {
        const feeds = _.difference(newFeeds, oldFeeds);
        watchedState.rssData.feeds = feeds;
      }

      setTimeout(() => rssGetter(link), 5000);
    })
    .catch((err) => {
      console.log(err);
    });
};

const app = () => {
  setLocale({
    string: {
      url: 'url',
    },
  });
  const userSchema = object().shape({
    value: string().url().nullable(),
  });

  const inputEl = document.getElementById('url-input');
  inputEl.focus();

  // const watchedState = onChange(state, (path, value) => {
  //   if (path === 'registrationForm') {
  //     handleFeedback({ processState: value.processState, key: value.mesagges });
  //   }
  // });

  const formEl = document.querySelector('.rss-form');

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');

    if (!state.results.includes(value)) {
      try {
        userSchema.validateSync({ value });
        watchedState.results.push(value);
        rssGetter(value);
        watchedState.registrationForm = { mesagges: 'success', processState: 'sent' };
        formEl.reset();
      } catch (err) {
        const [mesagges] = err.errors;
        watchedState.registrationForm = { mesagges, processState: 'error' };
      }
    } else {
      watchedState.registrationForm = { mesagges: 'repeatError', processState: 'error' };
    }
  });
};

export default app;
