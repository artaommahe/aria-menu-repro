# @angular/aria menu repro

Minimal app for two `@angular/aria/menu` bugs. The menu directives are the upstream example's
(`src/components-examples/aria/menu/simple-menu.ts`, 22.2.x), and the panel visibility rules are
from its `menu-example.css`.

- **A. Escape inside a submenu closes the whole menu tree** instead of only the submenu.
- **B. Enter on a menu item never activates the element itself.** `<a ngMenuItem href>` doesn't
  navigate, and `(click)` on a `<button ngMenuItem>` doesn't run. Mouse clicks work.
- **C. `ngMenuContent` is never destroyed once the trigger has been focused.** Rows are built on the
  trigger's `focusin` before the menu opens, and survive every close although `preserveContent` is
  `false`. Section D is the control: `ngTabContent` is destroyed when its tab is deselected.

Each section of the page lists its own steps.

## Run

```sh
npm install
npx ng serve --port 4417
node check.mjs 10   # scripted keyboard checks in Chromium, from a second shell
```

Result on Angular 22.2.4 + @angular/aria 22.2.6, Chromium 156, macOS:

```
A. Escape in submenu → only submenu closes, focus on parent row  0/10 as expected
B. Enter on <a ng-menu-item href="#target"> → navigates          0/10 as expected
B. Enter on <button ng-menu-item (click)> → (click) runs         0/10 as expected
B. mouse click on link row → navigates                           10/10 as expected
B. mouse click on (click) row → (click) runs                     10/10 as expected
```
