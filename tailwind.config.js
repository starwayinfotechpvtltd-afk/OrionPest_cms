// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /^(w|h|max-w|min-h|mx|my|px|py|p|m|mt|mb|ml|mr|pt|pb|pl|pr|gap)-/ },
    { pattern: /^(flex|grid|items|justify|self)-/ },
    { pattern: /^(text|font|leading|tracking)-/ },
    { pattern: /^(bg|border|from|to|via)-/ },
    { pattern: /^(rounded|overflow|relative|absolute|object)-/ },
    { pattern: /^(sm|md|lg|xl):/ },
  ],
  theme: { extend: {} },
  plugins: [],
};
