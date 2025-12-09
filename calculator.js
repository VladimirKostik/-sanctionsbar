document.addEventListener("DOMContentLoaded", () => {
  // Элементы
  const basePriceInput = document.getElementById("basePrice");
  const daysInput = document.getElementById("daysWithout");
  const totalElem = document.getElementById("totalPayout");
  const noticeElem = document.getElementById("notice");
  const resetBtn = document.getElementById("resetBtn");

  // Справочник значений для чекбоксов
  const checkboxMap = {
    smoking: 2000,
    nightNoise: 2000,
    drinking: 2000,
    garbage: 2000,
    rowdy: 2000,
    animal: 5000,
    wallDamage: 1000,
    sublease: 8000,
    lostKeys: 1000,
    accessBlock: 1000,
    neglectCheckout: 2000
  };

  // Собираем чекбоксы по id
  const checkboxIds = Object.keys(checkboxMap);
  const checkboxes = checkboxIds.map(id => document.getElementById(id));

  // Переменная для таймаута (предупреждение о выселении)
  let noticeTimeout = null;

  // Форматирование суммы (чтобы красиво показывать)
  function formatSum(value) {
    // округлим и отформатируем с разделителями тысяч
    return Math.round(value).toLocaleString('ru-RU');
  }

  // Основная функция расчёта
  function calculateTotal() {
    const base = Number(basePriceInput.value);
    const days = Math.max(0, Math.floor(Number(daysInput.value) || 0));

    // если base или days = 0, вычислим корректно — daysCost будет 0
    let daysCost = 0;
    if (base > 0 && days > 0) {
      // ПО формуле: (base / 30) / 2 * days
      // делаем расчёт аккуратно
      const perDay = base / 30;
      const halfPerDay = perDay / 2;
      daysCost = halfPerDay * days;
    }

    // Сумма по всем активным чекбоксам
    let checkSum = 0;
    for (const cb of checkboxes) {
      if (cb && cb.checked) {
        const v = checkboxMap[cb.id] || 0;
        checkSum += Number(v);
      }
    }

    const total = daysCost + checkSum;
    totalElem.textContent = formatSum(total);

    handleNotice(days);
  }

  // Показать/скрыть предупреждение при days >= 5
  function handleNotice(days) {
    if (days >= 5) {
      showNotice("ЕСТЬ СМЫСЛ ПОДУМАТЬ О ВЫСЕЛЕНИИ");
    }
    // если меньше 5 — ничего не показываем (предупреждение скрыто)
  }

  function showNotice(text) {
    // очистим предыдущий таймаут если был
    if (noticeTimeout) {
      clearTimeout(noticeTimeout);
      noticeTimeout = null;
    }
    noticeElem.textContent = text;
    noticeElem.hidden = false;
    noticeElem.classList.add("visible");

    // через 5 секунд скрыть
    noticeTimeout = setTimeout(() => {
      noticeElem.classList.remove("visible");
      // подождём анимацию и затем hidden
      setTimeout(() => {
        noticeElem.hidden = true;
        noticeElem.textContent = "";
      }, 300);
      noticeTimeout = null;
    }, 5000);
  }

  // Слушатели: на вводы и на изменения чекбоксов
  basePriceInput.addEventListener("input", calculateTotal);
  daysInput.addEventListener("input", calculateTotal);
  for (const cb of checkboxes) {
    if (cb) cb.addEventListener("change", calculateTotal);
  }

  // Сброс
  resetBtn.addEventListener("click", () => {
    basePriceInput.value = "";
    daysInput.value = "";
    for (const cb of checkboxes) if (cb) cb.checked = false;
    totalElem.textContent = "0";

    // убрать уведомление
    if (noticeTimeout) {
      clearTimeout(noticeTimeout);
      noticeTimeout = null;
    }
    noticeElem.hidden = true;
    noticeElem.textContent = "";
  });

  // Первый расчёт (на случай, если что-то уже заполнено)
  calculateTotal();
});
