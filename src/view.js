import onChange from 'on-change';
import { object, string } from 'yup';

const handleErrors = () => {
  const inputEl = document.getElementById('rss-input');
  inputEl.classList.toggle('is-invalid');
  inputEl.focus();
};

const app = () => {
  const userSchema = object({
    value: string().url().nullable(),
  });

  const state = {
    registrationForm: {
      valid: true,
      errors: null,
      results: [],
    },
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'registrationForm.errors') {
      handleErrors(value);
    }
  });

  const formEl = document.querySelector('.form');

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('rss');

    if (!state.registrationForm.results.includes(value)) {
      try {
        userSchema.validateSync({ value });
        watchedState.registrationForm.results.push(value);
        watchedState.registrationForm.errors = null;
        formEl.reset();
      } catch (err) {
        watchedState.registrationForm.errors = 'Не правильный формат запроса';
      }
    } else {
      watchedState.registrationForm.errors = 'RSS уже существует';
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
