/** @type {import('tailwindcss').Config} */
export const content = ["./dist/**/*.html"];
export const theme = {
  extend: {},
};
export const plugins = [
  require("daisyui"),
];
export const daisyui = {
  themes: ["night"],
};
