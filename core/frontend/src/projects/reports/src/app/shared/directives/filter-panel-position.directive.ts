import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

/**
 * Every grid's multi-select filter dropdown ('.ms-filter-panel' /
 * '.col-filter-panel') lives inside a scrollable table wrapper, and the
 * page's ancestors use transforms/filters, so a `position: fixed` panel left
 * in place is positioned relative to that ancestor instead of the viewport.
 *
 * This directive moves the open panel to <body> so nothing can offset it,
 * anchors it to the triggering filter button's viewport coordinates, keeps it
 * anchored while the page scrolls, and hides it when the button scrolls out
 * of view.
 */
@Directive({
  selector: '[filterPanelPosition]'
})
export class FilterPanelPositionDirective implements AfterViewInit, OnDestroy {

  private panel!: HTMLElement;
  private button: HTMLElement | null = null;
  private readonly reposition = () => this.place();

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    this.panel = this.el.nativeElement;
    const cell = this.panel.closest('th, td') as HTMLElement | null;
    this.button = cell?.querySelector('button') ?? null;
    if (!this.button) return;

    this.renderer.appendChild(document.body, this.panel);
    this.renderer.setStyle(this.panel, 'position', 'fixed');
    this.renderer.setStyle(this.panel, 'margin', '0');
    this.place();

    window.addEventListener('scroll', this.reposition, true);
    window.addEventListener('resize', this.reposition);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
    if (this.panel?.parentNode === document.body) {
      this.renderer.removeChild(document.body, this.panel);
    }
  }

  private place(): void {
    if (!this.button) return;

    const rect = this.button.getBoundingClientRect();
    const offscreen = rect.bottom < 0 || rect.top > window.innerHeight;
    this.renderer.setStyle(this.panel, 'display', offscreen ? 'none' : '');
    this.renderer.setStyle(this.panel, 'top', `${rect.bottom + 4}px`);
    this.renderer.setStyle(this.panel, 'left', `${rect.left}px`);
  }

}
