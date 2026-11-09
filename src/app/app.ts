import { Component, inject, signal, VERSION } from '@angular/core';
import { MenuContent, MenuTrigger } from '@angular/aria/menu';
import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';

import { ProbeLog, RowProbe } from './row-probe';
import { SimpleMenu, SimpleMenuItem } from './simple-menu';

@Component({
  selector: 'app-root',
  imports: [
    MenuTrigger,
    MenuContent,
    SimpleMenu,
    SimpleMenuItem,
    RowProbe,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabContent,
  ],
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
      <h2>C. ngMenuContent is never destroyed once the trigger has been focused</h2>
      <p>
        <code>preserveContent</code> is left at its default (<code>false</code>), so rows should exist only while
        the menu is open — as they do for <code>ngTabContent</code> in D below.
      </p>
      <ol>
        <li>Reload. "Live rows C" reads 0.</li>
        <li>
          Tab to "Open menu C" without opening it. Expected: 0. Actual: 2 — focusing the trigger builds the
          rows.
        </li>
        <li>Press Enter, then Escape. Expected: 0 once closed. Actual: 2, and they are never destroyed.</li>
      </ol>

      <p>Live rows C: <code id="live-c">{{ probe.live()['C'] ?? 0 }}</code></p>

      <button ngMenuTrigger [menu]="menuC" class="example-menu-trigger" id="trigger-c">Open menu C</button>

      <div ng-menu #menuC="ngMenu">
        <ng-template ngMenuContent>
          <div ng-menu-item value="Edit" rowProbe="C" probeLabel="Edit">Edit</div>
          <div ng-menu-item value="Delete" rowProbe="C" probeLabel="Delete">Delete</div>
        </ng-template>
      </div>
    </section>

    <section>
      <h2>D. Control: ngTabContent is destroyed when its tab is deselected</h2>
      <p>Click "Two", then "One". Each panel's content is destroyed as its tab is left (live count stays 1).</p>

      <p>Live panels D: <code id="live-d">{{ probe.live()['D'] ?? 0 }}</code></p>

      <div ngTabs>
        <div ngTabList selectedTab="one">
          <button ngTab value="one" id="tab-one">One</button>
          <button ngTab value="two" id="tab-two">Two</button>
        </div>

        <div ngTabPanel value="one">
          <ng-template ngTabContent><p rowProbe="D" probeLabel="One">Panel one</p></ng-template>
        </div>
        <div ngTabPanel value="two">
          <ng-template ngTabContent><p rowProbe="D" probeLabel="Two">Panel two</p></ng-template>
        </div>
      </div>
    </section>

    <section>
      <h2>Probe log</h2>
      <ol id="probe-log">
        @for (line of probe.lines(); track $index) {
          <li>{{ line }}</li>
        }
      </ol>
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
  probe = inject(ProbeLog);
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
