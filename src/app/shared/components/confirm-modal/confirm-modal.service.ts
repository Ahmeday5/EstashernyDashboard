import { Injectable, signal } from '@angular/core';

export type ConfirmTone = 'danger' | 'warning' | 'primary';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

export interface ConfirmState extends ConfirmOptions {
  confirmLabel: string;
  cancelLabel: string;
  tone: ConfirmTone;
}

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
  readonly state = signal<ConfirmState | null>(null);
  private resolveFn: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.state.set({
      confirmLabel: options.confirmLabel ?? 'تأكيد',
      cancelLabel: options.cancelLabel ?? 'إلغاء',
      tone: options.tone ?? 'danger',
      ...options,
    });

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  respond(result: boolean): void {
    this.resolveFn?.(result);
    this.resolveFn = null;
    this.state.set(null);
  }
}
