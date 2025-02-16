// @ts-check
/// <reference path="./types.d.ts" />

// Generate views based on JSON, using difference-detection for performance

/**
 * Virtual element, maps 1:1 to HTML element
 */
class VElement {
    /** Tag name (HTML-tag) @type string */
    tag;
    /** Node attributes @type AttrMap */
    attributes;
    /** Node children @type VElement[] */
    children;
    /** Parent node, if any @type VElement | undefined */
    parent;
    /** Corresponding HTML element @type HTMLElement */
    html;

    /**
     * @param {string} tag
     */
    constructor(tag) {
        this.tag = tag;
        this.html = document.createElement(tag);
        this.attributes = {};
        this.children = [];
    }

    /**
     * Remove element from child list
     *
     * @param {VElement} c
     */
    removeChild(c) {
        const idx = this.children.indexOf(c);
        if (idx < 0) {
            throw (new Error("Child does not exist in parent"));
        }
        this.children.splice(idx, 1);
        // Remove html
        this.html.removeChild(c.html);
        c.parent = undefined;
    }

    /**
     *
     * @param {VElement} c
     * @param {number} i
     */
    insertChild(c, i) {
        c.parent?.removeChild(c);
        // Parent of c has been removed, set new parent
        c.parent = this;
        // Add it
        this.children.splice(i, 0, c);
        // Update html parent
        const nxt = this.html.children[i];
        this.html.insertBefore(c.html, nxt);
    }
}

export class NodeRenderer {
    /** Root node @type VElement */
    _rootElement;

    /** Generation, used to detect deleted map entries */
    gen = 0;

    /**
     * Maps source node to generated virtual elements
     *
     * @type Map<NodeDesc, { vel: VElement, generation: number }>
     */
    _elementMap = new Map();

    /**
     *
     * @param {NodeDesc} desc
     */
    constructor(desc) {
        this._rootElement = new VElement(desc.tag);
        this.sync(desc);
    }

    /**
     *
     * @param {NodeDesc} desc
     */
    registerNewElement(desc) {
        const el = new VElement(desc.tag);
        this._elementMap.set(desc, { vel: el, generation: this.gen });
        return el;
    }

    sync(desc) {
        // Next gen
        this.gen++;

        this.syncAttributes(desc, this._rootElement);

        this.syncChildren(desc, this._rootElement);

        this.cleanMap();
    }

    /**
     * Sync nodes
     * @param {NodeDesc} src
     */
    _syncElement(src) {
        // Find generated virtual element that corresponds to the descriptor
        let entry = this._elementMap.get(src);

        // Note: it should exist (apart from for the root element) since all children are created if non-existent
        if (!entry) {
            throw new Error(`No entry for element ${src.tag} ${JSON.stringify(src.attributes)}. This should not happen as children are added to element list`);
        }
        entry.generation = this.gen;
        const vel = entry.vel;

        this.syncAttributes(src, vel);

        this.syncChildren(src, vel);

        // There's your result
        return entry;
    }

    /**
     *
     * @param {NodeDesc} src
     * @param {VElement} vel
     */
    syncAttributes(src, vel) {
        // remove attributes that will not be present anymore
        for (const k of Object.keys(vel.attributes)) {
            if (!src.attributes?.hasOwnProperty(k)) {
                vel.html.removeAttribute(k);
                delete vel.attributes[k];
            }
        }
        // add/modify new attributes
        if (src.attributes) {
            for (const [k, v] of Object.entries(src.attributes)) {
                if (vel.attributes[k] !== v) {
                    vel.attributes[k] = v;
                    if (typeof v === "boolean") {
                        if (v) {
                            vel.html.setAttribute(k, "");
                        }
                        else {
                            vel.html.removeAttribute(k);
                        }
                    }
                    else {
                        vel.html.setAttribute(k, v.toString());
                    }
                }
            }
        }
    }

    /**
     *
     * @param {NodeDesc} src
     * @param {VElement} vel
     */
    syncChildren(src, vel) {
        if (src.children) {
            for (let i = 0; i < src.children.length; i++) {
                const cs = src.children[i];
                /** Corresponding element */
                let vChild = this._elementMap.get(cs)?.vel;
                // Does it exist yet?
                if (!vChild) {
                    vChild = this.registerNewElement(cs);
                }
                if (vel.children[i] !== vChild) {
                    vel.insertChild(vChild, i);
                }
                this._syncElement(cs);
            }
            // Any other children need to be removed
            while (vel.children.length > src.children.length) {
                vel.removeChild(vel.children[vel.children.length - 1]);
            }
        }
        else {
            if (vel.children.length) {
                vel.children.length = 0;
                vel.html.innerHTML = "";
            }
        }
    }

    cleanMap() {
        // Remove map entries that no longer exist
        for (const [k, v] of this._elementMap) {
            if (v.generation !== this.gen) {
                this._elementMap.delete(k);
            }
        }
    }

    get node() {
        return this._rootElement;
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
    tag: "div",
    children: [
        {
            tag: "div",
            attributes: {
                expanded: true,
                style: "width: 200px; height: 100px; background-color: blue;",
                value: 4
            }
        },
        {
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

window.setTimeout(() => {
    nodeDesc.children[0].attributes["style"] = "width: 100px; height: 50px; background-color: red;";
    ns.sync(nodeDesc);
}, 3000);