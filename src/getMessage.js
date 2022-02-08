import i18n from 'i18next';

const i18nInstance = i18n.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru: {
      translation: {
        repeatError: 'RSS уже существует',
        url: 'Ссылка должна быть валидным URL',
        success: 'RSS успешно загружен',
        network: 'Ошибка сети',
      },
    },
  },
});

const getMessage = (key) => i18nInstance.t(key);

export default getMessage;
