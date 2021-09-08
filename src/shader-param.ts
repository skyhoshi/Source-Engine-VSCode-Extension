export class ShaderParam {

    public name: string;
    public type: string;
    public defaultCompletion: string | null;
    public description: string | null;
    public wikiUri: string | null;

    constructor(name: string, type: string, defaultCompletion: string | null, description: string, wikiUri: string | null) {
        this.name = name;
        this.type = type;
        this.defaultCompletion = defaultCompletion;
        this.description = description;
        this.wikiUri = wikiUri;
    }

}