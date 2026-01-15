const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "c02acf56-17ec-4b75-b64c-f9c1710de901",
    "Content-Type": "application/json",
  },
};

const getResponseData = (res) => {
  if (res.ok) {
    return res.json();
  } else {
    return Promise.reject("Ошибка: " + res.status);
  }
};

const getUserInfo = () => {
  return fetch(config.baseUrl + "/users/me", {
    headers: config.headers
  }).then(getResponseData);
};

const getCardList = () => {
  return fetch(config.baseUrl + "/cards", {
    headers: config.headers
  }).then(getResponseData);
};

const setUserInfo = (userData) => {
  return fetch(config.baseUrl + "/users/me", {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name: userData.name,
      about: userData.about
    })
  }).then(getResponseData);
};

const updateAvatar = (avatarUrl) => {
  return fetch(config.baseUrl + "/users/me/avatar", {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      avatar: avatarUrl
    })
  }).then(getResponseData);
};

const addNewCard = (newCard) => {
  return fetch(config.baseUrl + "/cards", {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      name: newCard.name,
      link: newCard.link
    })
  }).then(getResponseData);
};

const deleteCard = (id) => {
  return fetch(config.baseUrl + "/cards/" + id, {
    method: "DELETE",
    headers: config.headers
  }).then(getResponseData);
};

const changeLikeCardStatus = (cardId, liked) => {
  let methodToUse;
  if (liked) {
    methodToUse = "DELETE";
  } else {
    methodToUse = "PUT";
  }
  return fetch(config.baseUrl + "/cards/likes/" + cardId, {
    method: methodToUse,
    headers: config.headers
  }).then(getResponseData);
};

export {
  getUserInfo,
  getCardList,
  setUserInfo,
  updateAvatar,
  addNewCard,
  deleteCard,
  changeLikeCardStatus
};
