import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from './confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  protected readonly confirmService = inject(ConfirmModalService);

  protected respond(result: boolean): void {
    this.confirmService.respond(result);
  }
}
