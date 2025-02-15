// @ts-check

const NUM_SHADES = 8;

const colorDefs = [
    { name: "blue", color: "#3c82b7", n: NUM_SHADES },
    { name: "orange", color: "#ffa223", n: NUM_SHADES }
]

// Create and insert style variables for the palettes
colorDefs.forEach(cd => {
    createStyle(cd.name, cd.color, cd.n);
});

// Test palettes
colorDefs.forEach(cd => {
    createStyleSwatch(cd.name, cd.n);
})

function createStyleSwatch(name, n) {
    const colorSwatch = document.getElementById("colorSwatch");
    if (colorSwatch) {
        colorSwatch.insertAdjacentHTML("beforeend", `<div style="grid-column: 1/3; font-weight: bold;">${name}</div>`);
        const res = [];
        for (let i = 0; i < n; i++) {
            const styleVar = `--${name}-${i}`;
            res.push(`<div class="color-cell" style="background-color: var(${styleVar});"></div><div>${styleVar}</div>`);
        }
        const htmlCode = res.join("\n");
        colorSwatch.insertAdjacentHTML("beforeend", htmlCode);
    }
}

function createStyle(name, color, n) {
    let elStyle = document.querySelector("style");
    if (!elStyle) {
        elStyle = document.createElement("style");
        document.head.appendChild(elStyle);
    }
    const palette = createShades(color, n);
    const vars = palette.map((c, i) => `--${name}-${i}: ${c};`).join("\n");
    const cssCode = `body {\n${vars}}\n`;
    elStyle.insertAdjacentHTML("beforeend", cssCode);
}

/**
 *
 * @param {string} color
 * @param {number} n
 */
function createShades(color, n) {
    const res = new Array();
    if (color.startsWith("#")) {
        color = color.substring(1);
    }
    const rs = Number.parseInt(color.substring(0, 2), 16);
    const gs = Number.parseInt(color.substring(2, 4), 16);
    const bs = Number.parseInt(color.substring(4, 6), 16);
    for (let i = 0; i < n; i++) {
        const f = (n - i) / n;
        const fInv = (1 - f) * 256;
        const r = Math.floor(rs * f + fInv);
        const g = Math.floor(gs * f + fInv);
        const b = Math.floor(bs * f + fInv);
        // console.log(r.toString(16).padStart(2, "0"));
        const cOut = "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0");
        res.push(cOut);
    }
    return res;
}
