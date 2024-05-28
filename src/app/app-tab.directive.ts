import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({ selector: '[appTab]' })
export class AppTabDirective {
    @Input() tabId: TabId;
    @Input() tabTitle: string;

    constructor(public templateRef: TemplateRef<any>) {}
}

export type TabId = string | number;
