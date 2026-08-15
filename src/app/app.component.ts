import { Component, OnInit, inject, ErrorHandler } from '@angular/core';
import { ShellComponent } from './shared/components/shell/shell.component';
import { ThemeService } from './core/services/theme.service';
import { AppErrorPageComponent } from './shared/components/error-page/error-page.component';
import { AppErrorHandler } from './core/errors/app-error-handler';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent, AppErrorPageComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  public readonly errorHandler = inject(ErrorHandler) as AppErrorHandler;

  ngOnInit(): void {
    this.themeService.initialize();
  }
}
