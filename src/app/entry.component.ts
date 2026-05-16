import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'user-mf-entry',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class EntryComponent {}
