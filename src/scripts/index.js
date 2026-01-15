/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation } from "./components/validation.js";
import { 
  getCardList, 
  getUserInfo, 
  setUserInfo, 
  updateAvatar, 
  addNewCard,
  deleteCard,
  changeLikeCardStatus 
} from './components/api.js';

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const logo = document.querySelector(".logo");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup-info__list_type_definitions");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup-info__list_type_users");

let userId;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, definition) => {
  const template = document.getElementById("popup-info-definition-template");
  const element = template.content.cloneNode(true);
  
  element.querySelector(".popup-info__text_type_term").textContent = term;
  element.querySelector(".popup-info__text_type_definition").textContent = definition;
  
  return element;
};

const createUserElement = (userData, cardCount) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const element = template.content.cloneNode(true);
  
  const userNameElement = element.querySelector(".popup-info__user-name");
  const cardCountElement = element.querySelector(".popup-info__user-cards-count");
  
  userNameElement.textContent = userData.name;
  cardCountElement.textContent = ` [${cardCount}]`;
  
  return element;
};

const handleLogoClick = function() {
  usersStatsModalInfoList.innerHTML = '';
  usersStatsModalUsersList.innerHTML = '';
  
  usersStatsModalInfoList.append(createInfoString("Статус:", "Загрузка данных..."));
  openModalWindow(usersStatsModalWindow);
  
  getCardList().then(function(cards) {
    usersStatsModalInfoList.innerHTML = '';
    
    if(!cards || cards.length === 0) {
      usersStatsModalInfoList.append(createInfoString("Информация:", "Карточки не найдены"));
      return;
    }
    
    let totalCards = cards.length;
    
    usersStatsModalInfoList.append(createInfoString("Всего карточек:", totalCards + ''));
    
    let cardsCopy = cards.slice();
    cardsCopy.sort(function(a, b) {
      let dateA = new Date(a.createdAt);
      let dateB = new Date(b.createdAt);
      return dateA - dateB;
    });
    
    let firstCardDate = formatDate(new Date(cardsCopy[0].createdAt));
    let lastCardDate = formatDate(new Date(cardsCopy[cardsCopy.length - 1].createdAt));
    
    usersStatsModalInfoList.append(createInfoString("Первая создана:", firstCardDate));
    usersStatsModalInfoList.append(createInfoString("Последняя создана:", lastCardDate));
    
    let stats = {};
    
    for(let j = 0; j < cards.length; j++) {
      let card = cards[j];
      let ownerId = card.owner._id;
      if(!stats[ownerId]) {
        stats[ownerId] = {
          user: card.owner,
          cardCount: 0
        };
      }
      stats[ownerId].cardCount++;
    }
    
    let userIds = Object.keys(stats);
    usersStatsModalInfoList.append(createInfoString("Всего пользователей:", userIds.length + ''));
    
    let cardCounts = [];
    for(let userId in stats) {
      cardCounts.push(stats[userId].cardCount);
    }
    let maxCards = Math.max(...cardCounts);
    usersStatsModalInfoList.append(createInfoString("Максимум карточек от одного:", maxCards + ''));
    
    let usersTitle = document.createElement('h4');
    usersTitle.textContent = 'Все пользователи:';
    usersTitle.className = 'popup-info__users-title';
    usersStatsModalUsersList.parentNode.insertBefore(usersTitle, usersStatsModalUsersList);
    
    for(let userId in stats) {
      let stat = stats[userId];
      usersStatsModalUsersList.append(
        createUserElement(stat.user, stat.cardCount)
      );
    }
    
  }).catch(function(err) {
    console.log(err);
    usersStatsModalInfoList.innerHTML = '';
    usersStatsModalInfoList.append(createInfoString("Ошибка:", "Не удалось загрузить статистику"));
  });
};

const handlePreviewPicture = function(picture) {
  imageElement.src = picture.link;
  imageElement.alt = picture.name;
  imageCaption.textContent = picture.name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = function(likeButton, id, liked, updateCount) {
  changeLikeCardStatus(id, liked).then(function(card) {
    likeButton.classList.toggle('card__like-button_is-active');
    if(updateCount) {
      updateCount(card.likes.length);
    }
  }).catch(function(err) {
    console.log(err);
  });
};

const handleDeleteCard = function(id, element) {
  let deleteBtn = element.querySelector('.card__control-button_type_delete');
  if(!deleteBtn) return;
  
  let oldHTML = deleteBtn.innerHTML;
  let oldDisabled = deleteBtn.disabled;
  
  deleteBtn.innerHTML = 'Удаление...';
  deleteBtn.disabled = true;
  
  deleteCard(id).then(function() {
    element.remove();
  }).catch(function(err) {
    console.log(err);
    deleteBtn.innerHTML = oldHTML;
    deleteBtn.disabled = oldDisabled;
  });
};

const handleProfileFormSubmit = function(evt) {
  evt.preventDefault();
  
  let button = evt.target.querySelector('.popup__button');
  let oldText = button.textContent;
  button.textContent = 'Сохранение...';
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  }).then(function(data) {
    profileTitle.textContent = data.name;
    profileDescription.textContent = data.about;
    closeModalWindow(profileFormModalWindow);
  }).catch(function(err) {
    console.log(err);
  }).finally(function() {
    button.textContent = oldText;
  });
};

const handleAvatarFromSubmit = function(evt) {
  evt.preventDefault();
  
  let btn = evt.target.querySelector('.popup__button');
  let originalBtnText = btn.textContent;
  btn.textContent = 'Сохранение...';
  
  updateAvatar(avatarInput.value).then(function(user) {
    profileAvatar.style.backgroundImage = 'url(' + user.avatar + ')';
    closeModalWindow(avatarFormModalWindow);
  }).catch(function(err) {
    console.log(err);
  }).finally(function() {
    btn.textContent = originalBtnText;
  });
};

const handleCardFormSubmit = function(evt) {
  evt.preventDefault();
  
  let submitBtn = evt.target.querySelector('.popup__button');
  let btnText = submitBtn.textContent;
  submitBtn.textContent = 'Создание...';
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  }).then(function(card) {
    placesWrap.prepend(
      createCardElement(
        card,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        },
        userId
      )
    );
    closeModalWindow(cardFormModalWindow);
    cardForm.reset();
  }).catch(function(err) {
    console.log(err);
  }).finally(function() {
    submitBtn.textContent = btnText;
  });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", function() {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", function() {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", function() {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

logo.addEventListener("click", handleLogoClick);

let popups = document.querySelectorAll(".popup");
for(let p = 0; p < popups.length; p++) {
  setCloseModalWindowEventListeners(popups[p]);
}

Promise.all([getCardList(), getUserInfo()]).then(function(results) {
  let cards = results[0];
  let userData = results[1];
  
  userId = userData._id;
  
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = 'url(' + userData.avatar + ')';
  
  for(let c = 0; c < cards.length; c++) {
    placesWrap.append(
      createCardElement(
        cards[c],
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        },
        userId
      )
    );
  }
}).catch(function(err) {
  console.log(err);
});
