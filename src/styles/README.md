# @rumpushub/styles

This package provides the shared SCSS/CSS styles for Rumpus consumer apps. It includes variables, mixins, utilities, base element styles, components, and layout rules, compiled into a single CSS bundle.

---

## Installation

Install the package in your consumer app:

```bash
npm install @rumpushub/styles
```

or using yarn:

```bash
yarn add @rumpushub/styles
```

---

## Usage

### Import in JavaScript

Import the compiled CSS bundle directly in your JS entry point (e.g., `index.js` or `App.js`):

```js
// Import the compiled CSS from your common lib
import '@rumpushub/styles/dist/index.css';
```

This will include all global styles, components, and layout definitions in your app.

---

### Import in SCSS

If you want to extend or override variables in your SCSS, you can import the SCSS source:

```scss
// Optional: override variables first
$primary-color: #007BFF;

@use '@rumpushub/styles' as *;
```

This allows you to use all variables, mixins, utilities, and components defined in the library.

---

## Library Structure

The SCSS library is organized as follows:

- `_variables.scss` → Global color, font, and spacing variables.
- `_mixins.scss` → Reusable SCSS patterns and helper functions.
- `_utilities.scss` → Helper classes, fonts, spinner, spacing utilities.
- `_base.scss` → Base element styles (`body`, `h1`, `p`, etc.).
- `_components.scss` → Buttons, cards, modals, tabs, etc.
- `_layout.scss` → Structural layout classes (`.app-container`, navbar, sidebar, footer).

The `index.scss` file imports everything in a production-ready order:

1. Variables  
2. Mixins  
3. Utilities  
4. Base  
5. Components  
6. Layout  

This ensures that all dependencies are available to the styles that need them.

---

## Notes for Consumers

- CSS variables are used throughout, so overriding colors or fonts is easy via `:root` or by changing SCSS variables before importing.  
- A debug variable (`--missing-debug-var`) is included as a fallback to catch missing variable usage.  
- The library is compiled into `dist/index.css` for direct import, and all SCSS sources are available for customization.  
- You do **not** need to import individual component styles — everything is bundled in `index.css`.  

---

## Recommended Usage

1. Install the package in your consumer app.  
2. Import the CSS bundle at the top of your JS entry file:

```js
import '@rumpushub/styles/dist/index.css';
```

3. Optionally override SCSS variables before importing `@rumpushub/styles` if you need custom theming.  
4. Use the provided class names, components, and layout helpers in your app.

---

## Example

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
// Import compiled CSS
import '@rumpushub/styles/dist/index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

```scss
// Optional SCSS theming
$primary-color: #ff6600;
$background-color: #f7f7f7;

@use '@rumpushub/styles' as *;
```
