
import { TextDocument, CancellationToken, DocumentColorProvider, Color, ColorPresentation, Range, ColorInformation, languages, SemanticTokensLegend, SemanticTokensBuilder, ExtensionContext, DocumentSelector } from "vscode";
import { getDocument } from "./keyvalue-document";
import { KvTokensProviderBase, Processor } from "./keyvalue-parser/kv-token-provider-base";

export const legend = new SemanticTokensLegend([
    'struct',
    'comment',
    'variable',
    'string',
    'number',
    'boolean',
    'operator',
    'keyword',
    'parameter'
], [
    'declaration',
    'readonly'
]);

export const selector: DocumentSelector = "captions";

export function init(context: ExtensionContext) {
    const captionsColors = languages.registerColorProvider(selector, new CaptionColorsProvider());
    const captionsTokenProvider = languages.registerDocumentSemanticTokensProvider(selector, new CaptionsSemanticTokenProvider(), legend);
    context.subscriptions.push(captionsColors);
}

export class CaptionsSemanticTokenProvider extends KvTokensProviderBase {

    protected keyProcessors: Processor[] = [
        { regex: /.*/, processor: this.processKey }
    ];
    protected valueProcessors: Processor[] = [
        { regex: /.*/, processor: this.processValue }
    ];

    constructor() {
        super(legend, languages.createDiagnosticCollection('captions'));
    }

    processKey(content: string, range: Range, tokensBuilder: SemanticTokensBuilder, captures: RegExpMatchArray, document: TextDocument, scope: string) {
        tokensBuilder.push(range, "parameter");
    }

    processValue(content: string, range: Range, tokensBuilder: SemanticTokensBuilder, captures: RegExpMatchArray, document: TextDocument, scope: string) {
        
        if(scope === ".lang.tokens") {
            return; // Don't add a semantic token to  lang values and let tmLanguage handle it.
        }
        tokensBuilder.push(range, "string");
    }

}

export class CaptionColorsProvider implements DocumentColorProvider {
    
    provideDocumentColors(document: TextDocument, cancellationToken: CancellationToken) : ColorInformation[] {
        const lines = document.lineCount;

        const kvDoc = getDocument(document);
        if(kvDoc == null) return [];

        const colorInfos: ColorInformation[] = [];
        // TODO: Implement <playerclr>
        for(let i = 0; i < lines; i++) {
            if(cancellationToken.isCancellationRequested) break;
            
            // Get a line that isn't empty
            const kv = kvDoc.getKeyValueAt(i);
            if(kv == null) continue;

            const clrMatches = [...kv.value.matchAll(/<clr:(\d{1,3}),(\d{1,3}),(\d{1,3})>/g)];
            if(clrMatches.length == 0) continue;
            clrMatches.forEach(match => {
                const color = new Color(parseInt(match[1]) / 255, parseInt(match[2]) / 255, parseInt(match[3]) / 255, 1.0);
                const posStart = kv.value.indexOf(match[0]) + 5;
                const posEnd = posStart + kv.value.indexOf(">");
                const range = kv.valueRange.with(kv.valueRange.start.translate(0, posStart), kv.valueRange.start.translate(0, posEnd));
                colorInfos.push(new ColorInformation(range, color));
            });

        }

        return colorInfos;
    }

    provideColorPresentations(color: Color, context: {document: TextDocument, range: Range}, cancellationToken: CancellationToken) : ColorPresentation[] {
        return [];
    }
}