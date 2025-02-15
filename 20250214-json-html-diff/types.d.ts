interface NodeDesc {
    /** Tag name (HTML-tag) */
    tag: string;
    /** Node attributes */
    attributes: { [id: string]: any };
    /** Node children */
    children?: NodeDesc[];
}

type AttrMap = { [id: string]: any };
