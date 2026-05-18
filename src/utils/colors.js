export function getStablePaletteColor(key, palette) {

    let hash = 0;

    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }

    return palette[
        Math.abs(hash) % palette.length
    ];
}