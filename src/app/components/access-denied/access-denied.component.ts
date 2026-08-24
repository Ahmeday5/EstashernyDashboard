import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss',
})
export class AccessDeniedComponent {}
