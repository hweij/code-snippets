// @ts-check
/// <reference path="./types.d.ts" />

// Generate views based on JSON, using difference-detection for performance

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
     * @type AttrValue | undefined
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
        this.attributes = desc.attributes ? Object.assign({}, desc.attributes) : undefined;
        this.children = desc.children ? desc.children.map(c => new VElement(c)) : undefined;
        this.html = document.createElement(this.tag);
        if (this.attributes) {
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

    constructor(desc) {
        this._node = new VElement(desc);
    }

    /**
     * Sync nodes
     * @param {NodeDesc} desc
     */
    sync(desc) {
        // TODO
        // for each node:
        // - walk attributes, compare and sync (remove, add, change)
        // - for each child:
        //   - check if in place, if so, all is OK
        //   - check if already created
        //     - if not, create it first
        //     - else, remove from parent
        //     move it to the destination position
        // - Finally, process all children
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