import {Directive, HostListener} from "@angular/core";

@Directive({
    selector: "[InnerLink]"
})
export class InnerLinkDirective
{
    @HostListener("click", ["$event"])
    public onClick(event: any): boolean
    {
        event.stopPropagation();
        return false;
    }
}
