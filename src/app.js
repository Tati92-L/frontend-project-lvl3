/* eslint-disable no-param-reassign */
import { setLocale, object, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parsingFunc from './parser.js';
import onChangeState from './view.js';

const getProxyUrl = (url) => {
  const corsProxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  corsProxyUrl.searchParams.set('disableCache', 'true');
  corsProxyUrl.searchParams.set('url', url);
  return corsProxyUrl.toString();
};

const linkButtons = (watchedState, state) => {
  const modalButton = document.querySelectorAll('.btn-outline-primary');
  modalButton.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const { id } = e.target.dataset;
      const post = state.rssData.postItems[id];
      // eslint-disable-next-line no-param-reassign
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

const rssGetter = (link, watchedState, state) => {
  axios
    .get(getProxyUrl(link))
    .then((response) => {
      if (response.status === 200) return response.data;
      throw new Error('network');
    })
    .then((data) => {
      const { contents } = data;
      return parsingFunc(contents);
    })
    .then((rssData) => {
      console.log('hi!');
      const curData = state.rssData;
      const oldPosts = curData.postItems;
      const newPosts = rssData.postItems;
      const oldFeeds = curData.feeds;
      const newFeeds = rssData.feeds;

      if (!_.isEqual(oldPosts, newPosts)) {
        const posts = _.difference(newPosts, oldPosts);
        // eslint-disable-next-line no-param-reassign
        watchedState.rssData.postItems = posts;
        linkButtons(watchedState, state);
      }
      if (!_.isEqual(oldFeeds, newFeeds)) {
        const feeds = _.difference(newFeeds, oldFeeds);
        // eslint-disable-next-line no-param-reassign
        watchedState.rssData.feeds = feeds;
      }
      watchedState.results.push(link);
      watchedState.registrationForm = { mesagges: 'success', processState: 'sent' };
      setTimeout(() => rssGetter(link, watchedState, state), 5000);
    })
    .catch((err) => {
      const error = err.message === 'rssError' ? 'rssError' : 'network';
      watchedState.registrationForm = { mesagges: error, processState: 'error' };
    });
};

const app = () => {
  setLocale({
    string: {
      url: 'url',
    },
  });
  const userSchema = object().shape({
    value: string().required('empty').url().nullable(),
  });
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

  const elem = {
    form: document.querySelector('form'),
  };

  elem.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.registrationForm.processState = 'load';
    const formData = new FormData(e.target);
    const value = formData.get('url');

    if (!state.results.includes(value)) {
      try {
        userSchema.validateSync({ value });
      } catch (err) {
        const [mesagges] = err.errors;
        watchedState.registrationForm = { mesagges, processState: 'error' };
      }
      rssGetter(value, watchedState, state);
    } else {
      watchedState.registrationForm = { mesagges: 'repeatError', processState: 'error' };
    }
    elem.form.reset();
  });
};

export default app;
