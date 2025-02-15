interface NodeDesc {
    /** Unique ID, passed through the rendering to identify identical nodes */
    uuid: string;
    /** Tag name (HTML-tag) */
    tag: string;
    /** Node attributes */
    attributes: { [id: string]: any };
    /** Node children */
    children?: NodeDesc[];
}

type AttrMap = { [id: string]: any };
