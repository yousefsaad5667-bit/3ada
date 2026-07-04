import { Component, Input, Output, EventEmitter, ViewChild, ViewContainerRef, OnInit, Type, effect, signal, ComponentRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardState } from '../../models/dashboard-card.model';

@Component({
  selector: 'app-dashboard-card-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-card-shell.component.html',
  styleUrl: './dashboard-card-shell.component.scss'
})
export class DashboardCardShellComponent implements OnInit {
  @Input({ required: true }) titleAr!: string;
  @Input({ required: true }) componentType!: Type<unknown>;

  @Output() hideCard = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  state = signal<CardState>('loading');
  private componentRef?: ComponentRef<unknown>;

  constructor(private injector: Injector) {}

  ngOnInit() {
    this.componentRef = this.container.createComponent(this.componentType);
    
    // Read the signal from the component instance if it exists
    const instance = this.componentRef.instance as { cardState?: () => CardState; onRetry?: () => void };
    if (instance.cardState) {
       effect(() => {
          const stateFn = instance.cardState;
          if (stateFn) {
            this.state.set(stateFn());
          }
       }, { injector: this.injector });
    } else {
       // Fallback for components that don't implement the contract
       this.state.set('data');
    }
  }

  onHide(): void {
    this.hideCard.emit();
  }

  onRetry(): void {
    this.retry.emit();
    const instance = this.componentRef?.instance as { onRetry?: () => void } | undefined;
    if (instance?.onRetry) {
      instance.onRetry();
    }
  }
}
