import {RendererType} from "./basic"
import { hElement } from "../index";

export function bindDomMutation(parent: HTMLElement): HTMLElement;
export function render(parent: HTMLElement, component: RendererType<any>): HTMLElement;
export function shadow(strings: TemplateStringsArray, ...args: any[]): hElement;