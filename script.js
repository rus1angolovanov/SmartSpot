// ==================================================
// ФУНКЦИЯ ВАЛИДАЦИИ КОНТАКТА (Email или Telegram)
// ==================================================
function validateContact(contact) {
  if (!contact || contact.trim() === '') {
    return { valid: false, message: 'Поле контакта не может быть пустым' };
  }

  contact = contact.trim();

  // Проверка Email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Проверка Telegram (@username, минимум 5 символов, только латиница, цифры и подчеркивания)
  const telegramRegex = /^@[a-zA-Z0-9_]{4,}$/;

  if (emailRegex.test(contact)) {
    return { valid: true, type: 'email' };
  }
  
  if (telegramRegex.test(contact)) {
    return { valid: true, type: 'telegram' };
  }

  return { 
    valid: false, 
    message: 'Введите корректный email (example@mail.com) или Telegram (@username)' 
  };
}

// ==================================================
// ОСНОВНАЯ ФОРМА ЗАЯВКИ (на бесплатное занятие)
// Отправка через Make.com Webhook
// ==================================================
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const thanksDiv = document.getElementById('thanks');

// ✅ Защита от двойной отправки
let isSubmitting = false;

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ✅ Защита от повторной отправки
    if (isSubmitting) {
      console.warn('Форма уже отправляется');
      return;
    }

    // Собираем данные формы в объект
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // ✅ ВАЛИДАЦИЯ ПОЛЯ КОНТАКТА
    const contactField = data.contact || data.email || data.telegram; // укажи правильное имя поля
    const validation = validateContact(contactField);

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    // ✅ Дополнительные проверки (опционально)
    if (!data.name || data.name.trim() === '') {
      alert('Пожалуйста, укажите ваше имя');
      return;
    }

    // Блокируем кнопку и меняем текст
    isSubmitting = true;
    submitBtn.textContent = 'Отправляем...';
    submitBtn.disabled = true;

    // Добавляем тип заявки и дату
    data.formType = 'main_application';
    data.timestamp = new Date().toLocaleString('ru-RU');
    data.contactType = validation.type; // ✅ помечаем тип контакта (email/telegram)

    try {
      const response = await fetch('https://hook.us2.make.com/s7mkw9t9e2s6rnj632smmhq5417ib06x', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Успешная отправка — скрываем форму, показываем "спасибо"
        contactForm.style.display = 'none';
        thanksDiv.style.display = 'block';
        window.location.hash = 'thanks';

        // Отправляем событие в dataLayer (если используешь аналитику)
        if (window.dataLayer) {
          window.dataLayer.push({
            'event': 'form_submit',
            'formType': 'main_application'
          });
        }

      } else {
        alert('Ошибка отправки. Попробуйте позже или напишите нам в Telegram.');
        resetSubmitButton();
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Ошибка сети. Проверьте подключение к интернету.');
      resetSubmitButton();
    } finally {
      isSubmitting = false; // ✅ разблокируем в любом случае
    }
  });

  function resetSubmitButton() {
    submitBtn.textContent = 'Записаться на бесплатное занятие →';
    submitBtn.disabled = false;
    isSubmitting = false;
  }
}

// ==================================================
// МОДАЛЬНОЕ ОКНО "ЗАДАТЬ ВОПРОС"
// Отправка через тот же Make.com Webhook
// ==================================================
const modal = document.getElementById('modal');
const askBtn = document.getElementById('ask-question');
const closeBtn = document.getElementById('close-modal');
const questionForm = document.getElementById('question-form');

// ✅ Защита от двойной отправки для модалки
let isQuestionSubmitting = false;

if (askBtn) {
  askBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  });
}

// Закрытие по клику вне формы
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// Обработка отправки вопроса
if (questionForm) {
  const questionSubmitBtn = questionForm.querySelector('button[type="submit"]');

  questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ✅ Защита от повторной отправки
    if (isQuestionSubmitting) {
      console.warn('Вопрос уже отправляется');
      return;
    }

    const formData = new FormData(questionForm);
    const data = Object.fromEntries(formData.entries());

    // ✅ ВАЛИДАЦИЯ ПОЛЯ КОНТАКТА
    const contactField = data.contact || data.email || data.telegram; // укажи правильное имя поля
    const validation = validateContact(contactField);

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    // ✅ Проверка имени (опционально)
    if (!data.name || data.name.trim() === '') {
      alert('Пожалуйста, укажите ваше имя');
      return;
    }

    // ✅ Проверка вопроса
    if (!data.question || data.question.trim() === '') {
      alert('Пожалуйста, напишите ваш вопрос');
      return;
    }

    isQuestionSubmitting = true;
    questionSubmitBtn.textContent = 'Отправляем...';
    questionSubmitBtn.disabled = true;

    // Добавляем тип и дату
    data.formType = 'question';
    data.timestamp = new Date().toLocaleString('ru-RU');
    data.contactType = validation.type; // ✅ помечаем тип контакта

    try {
      const response = await fetch('https://hook.us2.make.com/s7mkw9t9e2s6rnj632smmhq5417ib06x', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Спасибо! Мы ответим вам в ближайшее время.');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        questionForm.reset();
      } else {
        alert('Ошибка отправки. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Ошибка сети. Попробуйте позже.');
    } finally {
      questionSubmitBtn.textContent = 'Отправить вопрос';
      questionSubmitBtn.disabled = false;
      isQuestionSubmitting = false; // ✅ разблокируем
    }
  });
}

// ==================================================
// ПЛАВНЫЙ ЯКОРНЫЙ СКРОЛЛ (для ссылок типа #courses)
// ==================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// ==================================================
// АНИМАЦИЯ ПРИ ПРОКРУТКЕ (fade-in для блоков)
// ==================================================
const animateOnScroll = () => {
  const elements = document.querySelectorAll('section h2, .features-grid, .courses-grid, .testimonials-grid, .steps-container');

  elements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (elementTop < windowHeight - 100) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  });
};

document.querySelectorAll('section h2, .features-grid, .courses-grid, .testimonials-grid, .steps-container').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// ==================================================
// UTM-метки (автосбор из URL)
// ==================================================
function setUTM() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  utmFields.forEach(field => {
    const input = document.querySelector(`input[name="${field}"]`);
    if (input) {
      input.value = urlParams.get(field) || '';
    }
  });
}

setUTM();