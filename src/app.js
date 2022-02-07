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

// const f = () => console.log('hey!');
// console.log('before timeout');
// setTimeout(f, 1000);
// console.log('after timeout');

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
