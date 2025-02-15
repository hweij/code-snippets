// @ts-check
/// <reference path="./types.d.ts" />

// Generate views based on JSON, using difference-detection for performance

/**
 * Virtual element, maps 1:1 to HTML element
 */
class VElement {
    /**
     * Unique ID, passed through the rendering to identify identical nodes
     * @type string
     */
    uuid;
    /**
     * Tag name (HTML-tag)
     * @type string
     */
    tag;
    /**
     * Node attributes
     * @type AttrMap
     */
    attributes;
    /**
     * Node children
     * @type VElement[] | undefined
     */
    children;
    /**
     * Corresponding HTML element
     * @type HTMLElement
     */
    html;

    /**
     * @param {NodeDesc} desc
     */
    constructor(desc) {
        this.uuid = desc.uuid;
        this.tag = desc.tag;
        this.attributes = Object.assign({}, desc.attributes);
        this.children = desc.children ? desc.children.map(c => new VElement(c)) : undefined;
        this.html = document.createElement(this.tag);
        for (const [k, v] of Object.entries(this.attributes)) {
            if (typeof v === "boolean") {
                if (v) {
                    this.html.setAttribute(k, "");
                }
                else {
                    this.html.removeAttribute(k);
                }
            }
            else {
                this.html.setAttribute(k, v.toString());
            }
        }
        if (this.children) {
            const children = this.children.map(c => c.html);
            this.html.append(...children);
        }
    }
}

export class NodeRenderer {
    /** Root node @type VElement */
    _node;

    /** Generation, used to detect deleted map entries */
    gen = 0;

    /**
     * Maps uuid to generated virtual elements
     *
     * @type Map<string, { vel: VElement, generation: number }>
     */
    _elementMap = new Map();

    constructor(desc) {
        this._node = new VElement(desc);
    }

    /**
     * Sync nodes
     * @param {NodeDesc} src
     */
    sync(src) {
        this.gen++;
        // 1. Find generated virtual element that corresponds to the descriptor uuid
        let entry = this._elementMap.get(src.uuid);
        if (!entry) {
            // Does not exist yet, create it
            entry = { vel: new VElement(src), generation: this.gen };
            this._elementMap.set(src.uuid, entry);
        }
        else {
            entry.generation = this.gen;
        }
        const vel = entry.vel;
        // 2. Synchronize attributes
        // remove attributes that will not be present anymore
        for (const k of Object.keys(vel.attributes)) {
            if (!src.hasOwnProperty(k)) {
                this.html.removeAttribute(k);
                delete vel.attributes[k];
            }
        }
        // add/modify new attributes
        for (const [k, v] of Object.keys(src.attributes)) {
            if (vel.attributes[k] !== v) {
                vel.attributes[k] = v;
                if (typeof v === "boolean") {
                    if (v) {
                        this.html.setAttribute(k, "");
                    }
                    else {
                        this.html.removeAttribute(k);
                    }
                }
                else {
                    this.html.setAttribute(k, v.toString());
                }
            }
        }

        // TODO: modify children
        //
        // walk through children in source, 1 by one starting at 0
        // if equal, go next
        // if different, look for uuid in map and move child to that index
        // when finished, remove all children in list past the length of the source child list
        // Recursively sync each child in the list

        // There's your result
        return entry;
    }

    cleanMap() {
        // Remove map entries that no longer exist
        const removeList = Object.entries(this._elementMap).filter(([k, v]) => v.gen !== this.gen);
        for (const [k, _v] of removeList) {
            this._elementMap.delete(k);
        }
    }

    get node() {
        return this._node;
    }

    get html() {
        return this.node.html;
    }
}

/**
 * Test json tree
 *
 * .NodeDesc
 */
const nodeDesc = {
    uuid: "100",
    tag: "div",
    children: [
        {
            uuid: "101",
            tag: "div",
            attributes: {
                expanded: true,
                style: "width: 200px; height: 100px; background-color: blue;",
                value: 4
            }
        },
        {
            uuid: "102",
            tag: "span",
            attributes: {
                expanded: false,
                value: 2
            }
        }
    ]
}

// TEST TEST
const ns = new NodeRenderer(nodeDesc);
console.log(ns.node);
document.body.appendChild(ns.html);