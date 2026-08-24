export type BadgeType = 'default' | 'amber' | 'green';

export function getBadgeClass(type?: BadgeType): string {
  switch (type) {
    case 'amber':
      return 'sbb sbb-am';
    case 'green':
      return 'sbb sbb-gr';
    default:
      return 'sbb';
  }
}
