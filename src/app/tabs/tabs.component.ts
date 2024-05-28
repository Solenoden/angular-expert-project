import {
  AfterContentInit,
  Component,
  computed,
  ContentChildren,
  EventEmitter,
  OnDestroy,
  Output,
  QueryList,
  signal,
  TemplateRef
} from '@angular/core';
import {from, merge, Subscription} from 'rxjs';
import {AppTabDirective, TabId} from '../app-tab.directive';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent implements AfterContentInit, OnDestroy {
  @ContentChildren(AppTabDirective) contentTabs: QueryList<AppTabDirective>;

  @Output() tabRemoved: EventEmitter<TabId> = new EventEmitter();

  private activeTabId = signal<TabId>(null);
  protected activeTabTemplate = computed<TemplateRef<any>>(
      () => this.tabs()?.find(x => x.tabId === this.activeTabId())?.templateRef
  );

  private tabs = signal<AppTabDirective[]>([]);
  private tabsRemoved = signal<TabId[]>([]);
  protected tabsToDisplay = computed<AppTabDirective[]>(this.getTabsToDisplay.bind(this));

  private tabChangesSubscription: Subscription;

  ngAfterContentInit(): void {
    this.trackTabs();
  }

  ngOnDestroy(): void {
    this.tabChangesSubscription.unsubscribe();
  }

  private trackTabs(): void {
    if (this.tabChangesSubscription) this.tabChangesSubscription.unsubscribe();
    const tabChanges$ = merge(this.contentTabs.changes, from([null]));

    this.tabChangesSubscription = tabChanges$.subscribe(() => {
      this.tabs.set(this.contentTabs.toArray());
      this.tabsRemoved.set([]);

      if (this.activeTabId() === null || this.activeTabId() === undefined) {
        this.activeTabId.set(this.tabs()[0]?.tabId);
      }
    });
  }

  public viewTab(tabId: TabId): void {
    this.activeTabId.set(tabId);
  }

  public removeTab(tabId: TabId): void {
    if (this.activeTabId() === tabId) {
      const activeTabIndex = this.tabsToDisplay().findIndex(x => x.tabId === tabId);
      const newActiveTabIndex = activeTabIndex === 0 ? activeTabIndex : activeTabIndex - 1;
      // TODO: Fix viewing of only tab when: there are two tabs left and the current tab is closed
      this.viewTab(this.tabsToDisplay()[newActiveTabIndex]?.tabId);
    }

    this.tabsRemoved.update(original => [...original, tabId]);
    this.tabRemoved.emit(tabId);
  }

  private getTabsToDisplay(): AppTabDirective[] {
    const tabsRemoved = this.tabsRemoved() ?? [];
    return this.tabs().filter(tab => !tabsRemoved.includes(tab.tabId));
  }
}
