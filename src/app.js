import { setLocale, object, string } from 'yup';
import axios from 'axios';
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

const rssGetter = (link) => {
  axios
    .get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(link)}`)
    .then((response) => {
      if (response.status === 200) return response.data;
      throw new Error('Network response was not ok.');
    })
    .then((data) => {
      const { contents } = data;
      return parsingFunc(contents);
    })
    .then((rssData) => {
      const curFeeds = state.rssData;
      // merge obj
      watchedState.rssData = { ...curFeeds, ...rssData };
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
