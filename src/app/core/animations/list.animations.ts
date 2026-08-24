import { animate, query, style, stagger, transition, trigger } from '@angular/animations';

/**
 * Staggered entrance for a `@for` grid of cards — bind [@staggerIn]="items.length" on the
 * grid container so the trigger re-fires whenever the item count changes (new page/filter).
 */
export const staggerInAnimation = trigger('staggerIn', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(10px) scale(0.98)' }),
        stagger(40, [
          animate('280ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);
