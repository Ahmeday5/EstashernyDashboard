import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Animates a number counting up from its previous value to `appCountUp` whenever the
 * input changes. Duration is fixed short (600ms) — this is a KPI-card polish detail,
 * not a data-viz element, so it never needs to be slow or configurable per caller.
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnChanges {
  @Input() appCountUp = 0;
  @Input() countUpSuffix = '';

  private currentValue = 0;
  private frame: number | null = null;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['appCountUp']) return;

    const from = this.currentValue;
    const to = this.appCountUp;
    const duration = 600;
    const start = performance.now();

    if (this.frame !== null) cancelAnimationFrame(this.frame);

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      this.el.nativeElement.textContent = value.toLocaleString('en-US') + this.countUpSuffix;

      if (progress < 1) {
        this.frame = requestAnimationFrame(step);
      } else {
        this.currentValue = to;
      }
    };

    this.frame = requestAnimationFrame(step);
  }
}
