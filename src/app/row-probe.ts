import { Directive, inject, Injectable, input, OnDestroy, OnInit, signal } from '@angular/core';

/** Counts the live instances per group and logs every create/destroy. */
@Injectable({ providedIn: 'root' })
export class ProbeLog {
  live = signal<Record<string, number>>({});
  lines = signal<string[]>([]);

  record(group: string, label: string, delta: 1 | -1): void {
    this.live.update((live) => ({ ...live, [group]: (live[group] ?? 0) + delta }));
    this.lines.update((lines) => [...lines, `${group}: "${label}" ${delta > 0 ? 'created' : 'destroyed'}`]);
  }
}

@Directive({ selector: '[rowProbe]' })
export class RowProbe implements OnInit, OnDestroy {
  #log = inject(ProbeLog);

  rowProbe = input.required<string>();
  probeLabel = input.required<string>();

  ngOnInit(): void {
    this.#log.record(this.rowProbe(), this.probeLabel(), 1);
  }

  ngOnDestroy(): void {
    this.#log.record(this.rowProbe(), this.probeLabel(), -1);
  }
}
