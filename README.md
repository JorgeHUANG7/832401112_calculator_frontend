# Calculator Frontend (前后端分离计算器 · 前端)

EE308FZ Software Engineering — Assignment 1: Front-End and Back-End
Separation Calculator System. This repository contains the **front end**:
a single-page calculator web application. It is responsible only for the
user interface — button interaction, expression input, sending requests to
the back end, and displaying the returned results / history / errors.

> The back end lives in a **separate repository**:
> https://github.com/JorgeHUANG7/832401112_calculator_backend

## Project Introduction

A clean, usable calculator UI built with plain HTML / CSS / JavaScript
(no framework, zero build step). The front end **never calculates** the
arithmetic result itself: it sends the raw expression to the back-end API
and displays whatever the back end returns. If the back end is stopped,
the front end cannot produce a new valid result.

Extra features implemented:

- Full keyboard support (digits, operators, `Enter` = calculate,
  `Esc` = clear, `Backspace` = backspace)
- Light / dark theme switch (preference kept in `localStorage` — this is a
  UI preference only; the calculation history itself always comes from the
  back-end database)
- History search box (filter by expression or result)
- "Clear all history" button

## Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Markup     | HTML5                               |
| Styling    | CSS3 (CSS variables, responsive)    |
| Logic      | Vanilla JavaScript (ES6+)           |
| HTTP       | `fetch` API                         |
| Static server | any (e.g. `python3 -m http.server`) |

## Directory Structure

```
calculator_frontend/
├── src/
│   ├── index.html        # calculator + history UI
│   ├── css/style.css     # styles, light/dark themes
│   └── js/calculator.js  # interaction, API calls, keyboard, theme
├── README.md
└── codestyle.md
```

## Runtime Environment

Any modern browser (Chrome, Edge, Firefox, Safari). No Node.js required to
run the app — only a static web server is needed.

## Installation

Nothing to install: just clone the repository. The page is static.

## Startup

Serve the `src/` directory with any static server, for example:

```bash
cd calculator_frontend/src
python3 -m http.server 5500
```

Then open `http://localhost:5500/index.html`.

## Configuration

The back-end API address is configured in `src/js/calculator.js`:

```js
const API_BASE = 'https://calculator-backend-oaoe.onrender.com';
```

For local development, change it to `http://127.0.0.1:8000`. The deployed
back end enables CORS for all origins, so any front-end address works.

## Connecting to the Back End

The front end uses the following API endpoints (see the back-end README for
the full contract):

| Method | Endpoint            | Used for                                  |
|--------|---------------------|-------------------------------------------|
| POST   | `/api/calculate`    | sending the expression, getting the result |
| GET    | `/api/history`      | loading the calculation history           |
| DELETE | `/api/history/{id}` | deleting one history record               |
| DELETE | `/api/history`      | clearing all history (extra)              |

Example request sent when the user presses `=`:

```js
fetch(`${API_BASE}/api/calculate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ expression: '12+8' }),
});
```

The UI displays `×` and `÷`; these are translated to `*` and `/` before
being sent (the back end also accepts them).

## How to Run the Whole Project

1. Start the back end (see the back-end repository README):
   `uvicorn app.main:app --port 8000`
2. Start the front end: `python3 -m http.server 5500` (inside `src/`)
3. Open `http://localhost:5500/index.html` and use the calculator.
