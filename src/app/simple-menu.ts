// Copied from angular/components src/components-examples/aria/menu/simple-menu.ts (22.2.x),
// trimmed to the directives this repro uses.
import { Menu, MenuBar, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { afterRenderEffect, Directive, effect, inject } from '@angular/core';

@Directive({
  selector: '[ng-menu]',
  hostDirectives: [{ directive: Menu }],
  host: {
    class: 'example-menu',
    popover: 'manual',
    '(beforetoggle)': 'onBeforeToggle()',
  },
})
export class SimpleMenu {
  menu = inject(Menu);

  constructor() {
    afterRenderEffect(() => {
      this.menu.visible() ? this.menu.element.showPopover() : this.menu.element.hidePopover();
    });
  }

  onBeforeToggle() {
    const parent = this.menu.parent() as MenuItem<string>;

    if (!parent) {
      return;
    }

    const parentRect = parent.element.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (parent instanceof MenuTrigger) {
      this.menu.element.style.left = `${parentRect.left + scrollX}px`;
      this.menu.element.style.top = `${parentRect.bottom + scrollY + 2}px`;
    } else if (!(parent.parent instanceof MenuBar)) {
      this.menu.element.style.left = `${parentRect.right + scrollX + 6}px`;
      this.menu.element.style.top = `${parentRect.y + scrollY - 5}px`;
    }
  }
}

@Directive({
  selector: '[ng-menu-item]',
  hostDirectives: [{ directive: MenuItem, inputs: ['value', 'disabled', 'submenu'] }],
  host: { class: 'example-menu-item' },
})
export class SimpleMenuItem {
  menuItem = inject<MenuItem<string>>(MenuItem);

  constructor() {
    effect(() => this.menuItem.searchTerm.set(this.menuItem.value() ?? ''));
  }
}
