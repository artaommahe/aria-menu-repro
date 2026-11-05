import { Component, signal, VERSION } from '@angular/core';
import { MenuContent, MenuTrigger } from '@angular/aria/menu';

import { SimpleMenu, SimpleMenuItem } from './simple-menu';

@Component({
  selector: 'app-root',
  imports: [MenuTrigger, MenuContent, SimpleMenu, SimpleMenuItem],
  host: {
    '(document:focusin)': 'trackFocus()',
    '(window:hashchange)': 'log("hashchange → " + hashNow())',
  },
  template: `
    <p>Angular {{ version }} · @angular/aria 22.2.6</p>

    <section>
      <h2>A. Escape inside a submenu closes the whole menu</h2>
      <ol>
        <li>Tab to "Open menu A", press Enter.</li>
        <li>ArrowDown to "Categorize", press ArrowRight.</li>
        <li>
          Press Escape. Expected (WAI-ARIA APG): only the submenu closes and focus returns to "Categorize".
          Actual: both menus close and focus returns to "Open menu A".
        </li>
      </ol>

      <button ngMenuTrigger [menu]="menuA" class="example-menu-trigger" id="trigger-a">Open menu A</button>

      <div ng-menu #menuA="ngMenu">
        <ng-template ngMenuContent>
          <div ng-menu-item value="Mark as read">Mark as read</div>
          <div ng-menu-item value="Categorize" [submenu]="categorize">Categorize ▸</div>

          <div ng-menu #categorize="ngMenu">
            <ng-template ngMenuContent>
              <div ng-menu-item value="Mark as important">Mark as important</div>
              <div ng-menu-item value="Star">Star</div>
            </ng-template>
          </div>

          <div ng-menu-item value="Archive">Archive</div>
        </ng-template>
      </div>
    </section>

    <section>
      <h2>B. Enter on a menu item never activates the element itself</h2>
      <ol>
        <li>Tab to "Open menu B", press Enter.</li>
        <li>On "Go to #target" press Enter. Expected: the URL hash becomes #target. Actual: nothing navigates.</li>
        <li>
          Reopen, ArrowDown to "Button with (click)", press Enter. Expected: "(click) ran" in the log.
          Actual: nothing is logged.
        </li>
        <li>Compare: clicking either item with the mouse works.</li>
      </ol>

      <button ngMenuTrigger [menu]="menuB" class="example-menu-trigger" id="trigger-b">Open menu B</button>

      <div ng-menu #menuB="ngMenu">
        <ng-template ngMenuContent>
          <a ng-menu-item value="link" href="#target">Go to #target</a>
          <button ng-menu-item value="button" type="button" (click)="log('(click) ran')">Button with (click)</button>
        </ng-template>
      </div>
    </section>

    <section>
      <h2>Log</h2>
      <p>Focused: <code id="focused">{{ focused() }}</code> · hash: <code id="hash">{{ hash() }}</code></p>
      <button type="button" (click)="reset()">Reset log + hash</button>
      <ol id="log">
        @for (line of lines(); track $index) {
          <li>{{ line }}</li>
        }
      </ol>
    </section>
  `,
  styles: `
    :host { display: block; font-family: system-ui, sans-serif; padding: 1rem; }
    section { margin-bottom: 2rem; }
    .example-menu-trigger { padding: 0.5rem 1rem; }
    .example-menu { margin: 0; width: 15rem; padding: 0.25rem; border: 1px solid #888; background: white; }
    /* The two rules below are from the upstream example CSS (menu-example.css). */
    .example-menu[popover] { left: auto; position: absolute; }
    .example-menu[data-visible='true'] { display: block; overflow: visible; }
    .example-menu-item { display: block; box-sizing: border-box; padding: 0.5rem; outline: none; color: inherit;
      text-decoration: none; width: 100%; text-align: left; border: 0; background: none; font: inherit; cursor: pointer; }
    .example-menu-item[data-active='true'] { background: #e0e0ff; }
    .example-menu-item:focus { outline: 2px solid #33f; }
  `,
})
export class App {
  version = VERSION.full;
  lines = signal<string[]>([]);
  focused = signal('');
  hash = signal(location.hash);

  hashNow(): string {
    return location.hash;
  }

  log(line: string): void {
    this.lines.update((lines) => [...lines, line]);
    this.hash.set(location.hash);
  }

  trackFocus(): void {
    this.focused.set(document.activeElement?.textContent?.trim() ?? '');
  }

  reset(): void {
    history.replaceState(null, '', location.pathname);
    this.lines.set([]);
    this.hash.set('');
  }
}
