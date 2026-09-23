/*
 * Calculator front-end logic.
 *
 * The front end is responsible ONLY for:
 *   - building the expression string from button / keyboard input
 *   - sending the expression to the back end over HTTP
 *   - displaying the result, the error message and the history
 *
 * The front end NEVER computes the arithmetic result itself; the core
 * calculation always happens on the back end (see the assignment
 * requirement: stop the back end and the front end must not be able to
 * obtain a new valid result).
 *
 * Code style: Google JavaScript Style Guide.
 */

'use strict';

/**
 * Base URL of the back-end API.
 * Change this to the deployed back-end address when needed.
 * @type {string}
 */
const API_BASE = 'http://127.0.0.1:8000';

/** @type {string} */
let expression = '';

/** @type {Array<Object>} */
let historyRecords = [];

/** @type {string} */
let searchKeyword = '';

/** @type {boolean} */
let lastWasError = false;

/* ------------------------------------------------------------------ */
/* DOM helpers                                                         */
/* ------------------------------------------------------------------ */

/** @return {HTMLElement} */
function $(id) {
  return document.getElementById(id);
}

/**
 * Translate the display operators (× ÷ −) into the API operators (* / -).
 * @param {string} expr
 * @return {string}
 */
function toApiExpression(expr) {
  return expr.replace(/×/g, '*').replace(/÷/g, '/');
}

/* ------------------------------------------------------------------ */
/* Display                                                             */
/* ------------------------------------------------------------------ */

function renderDisplay() {
  $('expression-display').textContent = expression;
  if (!lastWasError) {
    $('error-display').textContent = '';
  }
}

function showError(message) {
  lastWasError = true;
  $('result-display').textContent = 'Error';
  $('error-display').textContent = message;
}

function showResult(resultText) {
  lastWasError = false;
  $('result-display').textContent = resultText;
  $('error-display').textContent = '';
}

/* ------------------------------------------------------------------ */
/* Expression building                                                 */
/* ------------------------------------------------------------------ */

function appendToExpression(text) {
  if (lastWasError && /^[0-9(]/.test(text)) {
    // After an error, typing a digit or a parenthesis starts fresh.
    expression = '';
  }
  if (lastWasError) {
    lastWasError = false;
  }
  expression += text;
  renderDisplay();
}

function clearExpression() {
  expression = '';
  lastWasError = false;
  $('result-display').textContent = '0';
  $('error-display').textContent = '';
  renderDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  lastWasError = false;
  renderDisplay();
}

/** Insert a parenthesis, keeping a balanced pair where possible. */
function insertParen(value) {
  if (value === ')') {
    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;
    if (closeCount >= openCount) {
      return; // No open parenthesis to close.
    }
  }
  appendToExpression(value);
}

/** Insert / toggle the unary minus sign around the trailing number. */
function toggleSign() {
  if (expression === '' || /[+\-×÷(]$/.test(expression)) {
    appendToExpression('-');
    return;
  }
  const match = expression.match(/(\d+(?:\.\d+)?)$/);
  if (!match) {
    appendToExpression('-');
    return;
  }
  const number = match[1];
  const start = expression.length - number.length;
  const before = expression.slice(0, start);
  if (/[×÷(]$/.test(before)) {
    // e.g. "3*5" -> "3*-5"
    expression = before + '-' + number;
  } else if (before.endsWith('-') && (before.length === 1 || /[×÷(]$/.test(before.slice(0, -1)))) {
    // e.g. "3*-5" -> "3*5"
    expression = before.slice(0, -1) + number;
  } else {
    expression = before + '-' + number;
  }
  renderDisplay();
}

/* ------------------------------------------------------------------ */
/* Back-end communication                                              */
/* ------------------------------------------------------------------ */

/**
 * Send the expression to the back end and display the returned result.
 * The calculation itself is performed by the back end only.
 */
async function evaluate() {
  if (expression.trim() === '') {
    return;
  }
  const payload = { expression: toApiExpression(expression) };
  try {
    const response = await fetch(`${API_BASE}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      const message = (data.detail && data.detail.message) ||
                      data.message || 'Calculation failed';
      showError(message);
      return;
    }
    showResult(data.result);
    expression = '';
    renderDisplay();
    await loadHistory();
  } catch (error) {
    showError('无法连接后端服务，请确认后端已启动');
  }
}

/**
 * Load the calculation history from the back-end database.
 */
async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE}/api/history`);
    const data = await response.json();
    if (response.ok && data.success) {
      historyRecords = data.data || [];
      renderHistory();
    }
  } catch (error) {
    $('history-status').textContent = '历史加载失败：无法连接后端';
  }
}

/**
 * Delete one history record through the back-end API.
 * @param {number} id
 */
async function deleteHistoryItem(id) {
  try {
    const response = await fetch(`${API_BASE}/api/history/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      await loadHistory();
    } else {
      $('history-status').textContent = `删除记录 ${id} 失败`;
    }
  } catch (error) {
    $('history-status').textContent = '删除失败：无法连接后端';
  }
}

/**
 * Clear the whole history (extra feature).
 */
async function clearAllHistory() {
  if (historyRecords.length === 0) {
    return;
  }
  if (!window.confirm('确定要清空全部计算历史吗？')) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/api/history`, { method: 'DELETE' });
    if (response.ok) {
      await loadHistory();
    }
  } catch (error) {
    $('history-status').textContent = '清空失败：无法连接后端';
  }
}

/* ------------------------------------------------------------------ */
/* History rendering                                                   */
/* ------------------------------------------------------------------ */

function renderHistory() {
  const list = $('history-list');
  list.innerHTML = '';
  const keyword = searchKeyword.toLowerCase();
  const filtered = historyRecords.filter((record) => {
    if (!keyword) {
      return true;
    }
    return record.expression.toLowerCase().includes(keyword) ||
           record.result.toLowerCase().includes(keyword);
  });

  $('history-status').textContent = filtered.length > 0
    ? `共 ${historyRecords.length} 条记录` +
      (keyword ? `（匹配 ${filtered.length} 条）` : '')
    : (historyRecords.length > 0 ? '没有匹配的历史' : '');
  $('history-empty').style.display = filtered.length > 0 ? 'none' : 'block';

  filtered.forEach((record) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('data-id', String(record.id));

    const body = document.createElement('div');
    body.className = 'history-item-body';

    const expr = document.createElement('div');
    expr.className = 'history-item-expr';
    expr.textContent = record.expression;

    const meta = document.createElement('div');
    meta.style.cssText = 'display:flex;gap:8px;align-items:baseline;margin-top:2px;';

    const result = document.createElement('span');
    result.className = 'history-item-result';
    result.textContent = '= ' + record.result;

    const time = document.createElement('span');
    time.className = 'history-item-time';
    time.textContent = record.created_at;

    meta.appendChild(result);
    meta.appendChild(time);
    body.appendChild(expr);
    body.appendChild(meta);

    const del = document.createElement('button');
    del.className = 'history-item-delete';
    del.type = 'button';
    del.title = '删除这条记录';
    del.textContent = '🗑';
    del.addEventListener('click', () => deleteHistoryItem(record.id));

    li.appendChild(body);
    li.appendChild(del);
    list.appendChild(li);
  });
}

/* ------------------------------------------------------------------ */
/* Theme switching (extra feature)                                     */
/* ------------------------------------------------------------------ */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('calculator-theme', theme);
  } catch (error) {
    // localStorage may be unavailable; the theme simply won't persist.
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  let theme = 'light';
  try {
    theme = localStorage.getItem('calculator-theme') || 'light';
  } catch (error) {
    // Ignore: fall back to the light theme.
  }
  applyTheme(theme);
}

/* ------------------------------------------------------------------ */
/* Keyboard support (extra feature)                                    */
/* ------------------------------------------------------------------ */

function handleKeydown(event) {
  const key = event.key;
  if (/^[0-9]$/.test(key)) {
    appendToExpression(key);
    return;
  }
  if (key === '.') {
    appendToExpression('.');
    return;
  }
  if (key === '+' || key === '-') {
    appendToExpression(key);
    return;
  }
  if (key === '*') {
    appendToExpression('×');
    return;
  }
  if (key === '/') {
    event.preventDefault();
    appendToExpression('÷');
    return;
  }
  if (key === '(' || key === ')') {
    insertParen(key);
    return;
  }
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluate();
    return;
  }
  if (key === 'Escape') {
    clearExpression();
    return;
  }
  if (key === 'Backspace') {
    backspace();
  }
}

/* ------------------------------------------------------------------ */
/* Initialisation                                                      */
/* ------------------------------------------------------------------ */

function init() {
  initTheme();
  $('theme-toggle').addEventListener('click', toggleTheme);
  $('clear-history').addEventListener('click', clearAllHistory);
  $('history-search').addEventListener('input', (event) => {
    searchKeyword = event.target.value.trim();
    renderHistory();
  });

  document.querySelectorAll('.key').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const value = button.dataset.value;
      switch (action) {
        case 'digit':
          appendToExpression(value);
          break;
        case 'op':
          appendToExpression(value);
          break;
        case 'paren':
          insertParen(value);
          break;
        case 'dot':
          appendToExpression('.');
          break;
        case 'clear':
          clearExpression();
          break;
        case 'backspace':
          backspace();
          break;
        case 'negate':
          toggleSign();
          break;
        case 'equals':
          evaluate();
          break;
        default:
          break;
      }
    });
  });

  document.addEventListener('keydown', handleKeydown);
  loadHistory();
}

document.addEventListener('DOMContentLoaded', init);
