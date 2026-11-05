// Drives both scenarios with real keyboard input and counts how often each behaves as expected.
// Usage: npx ng serve --port 4417 (in another shell), then: node check.mjs [runs]
import { chromium } from 'playwright';

const runs = Number(process.argv[2] ?? 10);
const url = process.env.URL ?? 'http://localhost:4417/';
const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

const browser = await chromium.launch();
const page = await browser.newPage();

const focusedText = () => page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
const openMenuCount = () =>
  page.evaluate(() => [...document.querySelectorAll('[ng-menu]')].filter((menu) => menu.matches(':popover-open')).length);
const logHas = (text) => page.evaluate((expected) => document.querySelector('#log')?.textContent?.includes(expected) ?? false, text);
const hashIs = (hash) => page.evaluate((expected) => location.hash === expected, hash);

async function press(key) {
  await page.keyboard.press(key);
  await settle();
}

/** Loads the page, Tabs to the trigger and opens its menu with Enter. */
async function openWithKeyboard(triggerId) {
  await page.goto(url);
  await page.waitForSelector(`#${triggerId}`);

  for (let step = 0; step < 20 && (await page.evaluate(() => document.activeElement?.id)) !== triggerId; step++) {
    await page.keyboard.press('Tab');
  }

  await press('Enter');
}

async function moveFocusTo(rowText) {
  for (let step = 0; step < 10 && !(await focusedText()).startsWith(rowText); step++) {
    await press('ArrowDown');
  }

  if (!(await focusedText()).startsWith(rowText)) {
    throw new Error(`could not reach row "${rowText}"`);
  }
}

function tally(label, outcomes) {
  console.log(`${label.padEnd(64)} ${outcomes.filter(Boolean).length}/${outcomes.length} as expected`);
}

const escapeOneLevel = [];
const linkByKeyboard = [];
const clickRowByKeyboard = [];
const linkByMouse = [];
const clickRowByMouse = [];

for (let run = 0; run < runs; run++) {
  await openWithKeyboard('trigger-a');
  await moveFocusTo('Categorize');
  await press('ArrowRight');
  await press('Escape');
  escapeOneLevel.push((await openMenuCount()) === 1 && (await focusedText()).startsWith('Categorize'));

  await openWithKeyboard('trigger-b');
  await moveFocusTo('Go to #target');
  await press('Enter');
  linkByKeyboard.push(await hashIs('#target'));

  await openWithKeyboard('trigger-b');
  await moveFocusTo('Button with (click)');
  await press('Enter');
  clickRowByKeyboard.push(await logHas('(click) ran'));

  await page.goto(url);
  await page.click('#trigger-b');
  await settle();
  await page.click('a[ng-menu-item]');
  await settle();
  linkByMouse.push(await hashIs('#target'));

  await page.goto(url);
  await page.click('#trigger-b');
  await settle();
  await page.click('button[ng-menu-item]');
  await settle();
  clickRowByMouse.push(await logHas('(click) ran'));
}

console.log(`chromium ${browser.version()} · ${runs} runs\n`);
tally('A. Escape in submenu → only submenu closes, focus on parent row', escapeOneLevel);
tally('B. Enter on <a ng-menu-item href="#target"> → navigates', linkByKeyboard);
tally('B. Enter on <button ng-menu-item (click)> → (click) runs', clickRowByKeyboard);
tally('B. mouse click on link row → navigates', linkByMouse);
tally('B. mouse click on (click) row → (click) runs', clickRowByMouse);

await browser.close();
