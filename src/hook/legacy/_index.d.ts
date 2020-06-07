import { RendererType } from "./_basic";
import { hElement } from "../../base/index";

export function bindDomMutation(parent: HTMLElement): HTMLElement;
export function render(
    parent: HTMLElement,
    component: RendererType<any>
): HTMLElement;
export function shadow(strings: TemplateStringsArray, ...args: any[]): hElement;
