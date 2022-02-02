/* eslint-disable quote-props */
import onChange from 'on-change';
import { setLocale, object, string } from 'yup';
import getMessage from './messages.js';

const handleErrors = (error) => {
  const inputEl = document.getElementById('rss-input');
  inputEl.classList.remove('is-invalid');
  if (error) {
    inputEl.classList.add('is-invalid');
  }
  inputEl.focus();
};

const handleFeedback = ({ processState, key }) => {
  const cardEl = document.querySelector('.card');
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

const app = () => {
  setLocale({
    string: {
      url: 'url',
    },
  });
  const userSchema = object().shape({
    value: string().url(),
  });

  const inputEl = document.getElementById('rss-input');
  inputEl.focus();

  // .then(function (t) {
  //   // initialized and ready to go!
  //   document.getElementById('output').innerHTML = i18next.t('key');
  // });

  const state = {
    registrationForm: {
      mesagges: null,
      processState: 'filling',
    },
    results: [],
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'registrationForm') {
      handleFeedback({ processState: value.processState, key: value.mesagges });
    }
  });

  const formEl = document.querySelector('.form');

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('rss');

    if (!state.results.includes(value)) {
      try {
        userSchema.validateSync({ value });
        watchedState.results.push(value);
        watchedState.registrationForm = { mesagges: 'success', processState: 'sent' };
        formEl.reset();
      } catch (err) {
        const [mesagges] = err.errors;
        watchedState.registrationForm = { mesagges, processState: 'error' };
      }
    } else {
      watchedState.registrationForm = { mesagges: 'repeatError', processState: 'error' };
    }

    // const fetching = (value) => {
    //     fetch(value)
    //     .then((response) => {
    //         console.log(response);
    //     })
    //     .catch((e) => console.log('error: ', e));
    // }
  });
};

export default app;
