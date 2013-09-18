/// <reference path='codemirror.d.ts' />

declare module CodeMirror {
    export function showHint(
        cm: CodeMirror.Editor,
        getHint: (cm?: CodeMirror.Editor, options?) => {
            list: {
                className?: string;
                displayText?: string;
                text?: string;
                render?: (elt: HTMLElement, data: any, completion: any) => void;
            }[];
        },
        options?: {
            closeCharacters?: string;
            async?: boolean;
            completeSingle?: boolean;
            customKeys?: any;
        });
}