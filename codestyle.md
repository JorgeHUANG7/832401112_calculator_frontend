# Code Style — Calculator Frontend (JavaScript / HTML / CSS)

## Source of the standard

This document is derived from the following official / widely recognised
standards:

1. **Google JavaScript Style Guide**
   https://google.github.io/styleguide/jsguide.html
2. **Airbnb JavaScript Style Guide**
   https://github.com/airbnb/javascript
3. **Google HTML/CSS Style Guide**
   https://google.github.io/styleguide/htmlcssguide.html

The rules below are the subset that this project actually follows; when a
topic is not covered here, the guides above are the authority.

## JavaScript

### 1. Formatting

- **Indentation**: 2 spaces per level. No tabs.
- **Line length**: at most 80 characters; wrap long lines with
  parentheses.
- **Quotes**: single quotes for string literals; template literals when
  interpolation is needed.
- **Semicolons**: required at the end of statements.
- **Trailing whitespace**: forbidden.
- One blank line between top-level functions.

### 2. Naming

| Category        | Convention        | Example                        |
|-----------------|-------------------|--------------------------------|
| Function        | `lowerCamelCase`  | `appendToExpression()`         |
| Variable        | `lowerCamelCase`  | `historyRecords`, `searchKeyword` |
| Constant        | `UPPER_CASE`      | `API_BASE`                     |
| Private helper  | leading `_`       | `_tokenize` (not used in JS here) |
| CSS classes     | `kebab-case`      | `history-item-delete`          |
| File names      | `lowercase`       | `calculator.js`, `style.css`   |

### 3. Variables

- Declare with `const` by default; use `let` only when the value must be
  reassigned. `var` is forbidden.
- Declare one variable per statement.
- Group declarations at the top of the function / block scope where they
  are used.

### 4. Functions

- Prefer arrow functions for callbacks; use `function` declarations for
  named top-level functions.
- Every function has a JSDoc-style comment describing its purpose:
  ```js
  /**
   * Load the calculation history from the back-end database.
   */
  async function loadHistory() { ... }
  ```
- Keep functions small and single-purpose.

### 5. Asynchronous code

- Use `async` / `await` for network calls; avoid nested `.then()` chains.
- Always handle failure: wrap `fetch` in `try / catch` and show a
  user-visible error message.

### 6. DOM access

- Use `document.getElementById()` / `querySelector` instead of global
  `document.xxx` forms.
- Use `textContent` (not `innerHTML`) when inserting plain text to avoid
  XSS.
- Listeners are attached in an `init()` function at the end of the file.

## HTML

- HTML5 doctype `<!DOCTYPE html>`; `lang="zh-CN"`.
- Use semantic tags (`header`, `main`, `section`, `footer`).
- Every interactive element has a clear label / `aria-label`.
- Indent with 2 spaces; attributes use double quotes.

## CSS

- Use CSS variables (`:root { --accent: ...; }`) for theming.
- Class names use `kebab-case` and describe the element's purpose.
- No `!important` unless absolutely necessary.
- Prefer flexbox / grid; the layout must stay usable on mobile
  (`@media (max-width: 720px)`).
- Keep selector specificity low; avoid `#id`-based styling where a class
  works.

## Anti-patterns to Avoid

- `eval()` / `new Function()` / `exec` on user input — **forbidden**; the
  front end never computes the result.
- `var`; implicit globals; missing semicolons.
- `innerHTML` with untrusted content.
- Console-logging in production code paths that run on every click.
