import i18next from 'i18next';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru: {
      translation: {
        repeatError: 'RSS уже существует',
        url: 'Ссылка должна быть валидным URL',
        success: 'RSS успешно загружен',
        network: 'Ошибка сети',
        empty: 'Не должно быть пустым',
        watchLink: 'Просмотр',
      },
    },
  },
});

const getMessage = (key) => i18nextInstance.t(key);

export default getMessage;
