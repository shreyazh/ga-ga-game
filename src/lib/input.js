const keys = [];
export const getKey = key => keys.includes(key);

export function listenKeys() {
    function keyDown(e) {
        if (keys.includes(e.key)) return;
        keys.push(e.key);
    }

    function keyUp(e) {
        const index = keys.indexOf(e.key);
        if (index == -1) return;
        keys.splice(index, 1);
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
        window.removeEventListener("keydown", keyDown);
        window.removeEventListener("keyup", keyUp);
    };
}
