import { animate, query, style, transition, trigger } from '@angular/animations';

/**
 * Fires on every route change (the trigger binding uses the outlet's activated-route
 * path as its state, so any URL change is treated as a distinct state transition).
 * Only animates :enter — the outgoing view is torn down by the router before the new
 * one mounts, so there is no simultaneous :leave to coordinate with.
 */
export const routeFadeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' })], {
      optional: true,
    }),
    query(
      ':enter',
      [animate('220ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))],
      { optional: true },
    ),
  ]),
]);
