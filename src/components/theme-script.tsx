import type { ThemeMode } from "@/lib/site-settings/theme";

export function getThemeScript(defaultMode: ThemeMode): string {
  return `try{var t=localStorage.getItem('theme');if(!t){t='${defaultMode}';localStorage.setItem('theme',t)}var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.theme=t}catch(e){}`;
}
