// Crown contour traced from logo-clean-gold.webp (1200x570), not a stock symbol.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { chromium } from '@playwright/test';
const base = path.resolve(__dirname, '..');
const fonts = fs.readdirSync(path.join(base,'node_modules/@fontsource/vazirmatn/files'));
const font = fs.readFileSync(path.join(base, 'node_modules/@fontsource/vazirmatn/files', fonts.find(f=>f.includes('arabic-900-normal.woff2'))));
const crown = `<g transform="translate(12 9) scale(.87)"><path d="M46 89 L133 142 L132 24 L195 119 L239 24 L234 138 L281 137 L116 221 Z" fill="#071229" stroke="#ffd42a" stroke-width="14" stroke-linejoin="round"/><path d="M46 89 L133 142 L132 24 L195 119 L239 24 L234 138 M116 221 Q184 164 281 137" fill="none" stroke="#fff6a5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const css = `<style>@font-face{font-family:Vazirmatn;src:url(data:font/woff2;base64,${font.toString('base64')})}text{font-family:Vazirmatn; font-weight:900}</style>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">${css}${crown}<text x="140" y="265" text-anchor="middle" direction="rtl" font-size="45" fill="#ffd42a">کنترل زد</text></svg>`;
const small = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 15 240 210">${crown}</svg>`;
fs.writeFileSync(path.join(base,'public/favicon.svg'), svg);
fs.writeFileSync(path.join(base,'src/app/icon.svg'), svg);
fs.writeFileSync(path.join(base,'public/site.webmanifest'), JSON.stringify({name:'CTRL.Z',short_name:'CTRL.Z',icons:[{src:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'},{src:'/favicon.svg',sizes:'any',type:'image/svg+xml'}],display:'standalone',start_url:'/',background_color:'#071229',theme_color:'#071229'}));
(async()=>{
 const browser=await chromium.launch({headless:true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const page=await browser.newPage();
 for(const [size,name,content] of [[16,'favicon-16.png',small],[32,'favicon-32.png',svg],[180,'apple-touch-icon.png',svg]]){
  await page.setViewportSize({width:size,height:size});
  await page.setContent(`<style>body{margin:0;background:transparent}img{width:100%;height:100%}</style><img src="data:image/svg+xml;base64,${Buffer.from(content).toString('base64')}"/>`);
  await page.locator('img').evaluate(img=>img.decode());
  await page.screenshot({path:path.join(base,'public',name),omitBackground:true});
 }
 await browser.close();
 fs.copyFileSync(path.join(base,'public/apple-touch-icon.png'),path.join(base,'src/app/icon.png'));
})();
