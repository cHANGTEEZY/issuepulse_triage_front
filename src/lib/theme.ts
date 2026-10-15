export const THEME_STORAGE_KEY = "theme";

export type Theme = "dark" | "light";

export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")==="light";if(t)document.documentElement.classList.add("light");document.documentElement.dataset.theme=t?"light":"dark"}catch(e){}`;
