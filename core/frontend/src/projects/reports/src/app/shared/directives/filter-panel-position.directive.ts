import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

/**
 * Every grid's multi-select filter dropdown ('.ms-filter-panel' /
 * '.col-filter-panel') lives inside a scrollable table wrapper
 * ('overflow: auto'), so a plain `position: absolute; top: 100%` panel gets
 * clipped at the wrapper's edge instead of floating above the page — only
 * the first row or two of options are visible, the rest is cut off.
 *
 * This directive switches the panel to `position: fixed`, positioned from
 * the triggering filter button's actual viewport coordinates (computed
 * fresh each time the panel opens, since it's created via *ngIf), which
 * escapes the clipping ancestor entirely.
 */
@Directive({
  selector: '[filterPanelPosition]'
})
export class FilterPanelPositionDirective implements AfterViewInit {

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    const panel = this.el.nativeElement;
    const cell = panel.closest('th, td') as HTMLElement | null;
    const button = cell?.querySelector('button');
    if (!button) return;

    const rect = button.getBoundingClientRect();
    this.renderer.setStyle(panel, 'position', 'fixed');
    this.renderer.setStyle(panel, 'margin', '0');
    this.renderer.setStyle(panel, 'top', `${rect.bottom + 4}px`);
    this.renderer.setStyle(panel, 'left', `${rect.left}px`);
  }

}
