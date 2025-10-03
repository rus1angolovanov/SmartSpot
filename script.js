// ==================================================
// ОСНОВНАЯ ФОРМА ЗАЯВКИ (на бесплатное занятие)
// Отправка через Make.com Webhook
// ==================================================
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const thanksDiv = document.getElementById('thanks');

function isValidContact(contact) {
  const tgRegex = /^@[a-zA-Z0-9_]{5,32}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return tgRegex.test(contact) || emailRegex.test(contact);
}


if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Блокируем кнопку и меняем текст
    submitBtn.textContent = 'Отправляем...';
    submitBtn.disabled = true;

    // Собираем данные формы в объект
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    if (!isValidContact(data.contact)) {
      alert('Пожалуйста, укажите корректный контакт: либо @username в Telegram, либо email.');
      resetSubmitButton();
      return; // прерываем отправку
    }

    // Добавляем тип заявки и дату
    data.formType = 'main_application';
    data.timestamp = new Date().toLocaleString('ru-RU');

    try {
      // ⚠️ ЗАМЕНИ ЭТОТ URL НА СВОЙ MAKE.COM WEBHOOK
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
    }
  });

  function resetSubmitButton() {
    submitBtn.textContent = 'Записаться на бесплатное занятие →';
    submitBtn.disabled = false;
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

if (askBtn) {
  askBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // запрещаем скролл при открытом модальном окне
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // разрешаем скролл
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

    questionSubmitBtn.textContent = 'Отправляем...';
    questionSubmitBtn.disabled = true;

    const formData = new FormData(questionForm);
    const data = Object.fromEntries(formData.entries());

    // Добавляем тип и дату
    data.formType = 'question';
    data.timestamp = new Date().toLocaleString('ru-RU');

    try {
      // ⚠️ ТОТ ЖЕ MAKE.COM WEBHOOK
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
    }

    questionSubmitBtn.textContent = 'Отправить вопрос';
    questionSubmitBtn.disabled = false;
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
        top: targetElement.offsetTop - 80, // смещение под шапку
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

// Добавляем начальные стили для анимации
document.querySelectorAll('section h2, .features-grid, .courses-grid, .testimonials-grid, .steps-container').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll); // на случай, если элементы уже в зоне видимости

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

// Добавь эти поля в обе формы (основную и модальную), если хочешь собирать UTM:
/*
<input type="hidden" name="utm_source">
<input type="hidden" name="utm_medium">
<input type="hidden" name="utm_campaign">
<input type="hidden" name="utm_term">
<input type="hidden" name="utm_content">
*/

setUTM();