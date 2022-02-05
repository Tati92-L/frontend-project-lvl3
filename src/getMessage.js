import i18n from 'i18next';

const i18nInstance = i18n.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru: {
      translation: {
        repeatError: 'RSS уже существует',
        url: 'Не правильный формат запроса',
        success: 'RSS успешно загружен',
        network: 'Проблема с сетью. Попробуйте еще раз.',
      },
    },
  },
});

const getMessage = (key) => i18nInstance.t(key);

export default getMessage;
