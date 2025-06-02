const TICK_MS = 10;

export class Scene {
    constructor({ getData, update, render }) {
        this.getData = getData;
        this.update = update;
        this.render = render;
    }

    async run(oldData = {}) {
        let interval, render, renderLoop;
        this.data = await this.getData(oldData);

        return await new Promise((_resolve, reject) => {
            const resolve = value => {
                clearInterval(interval);
                cancelAnimationFrame(render);
                _resolve(value);
            };

            interval = setInterval(() => {
                try {
                    this.update(TICK_MS / 1_000, resolve);
                } catch (e) {
                    clearInterval(interval);
                    cancelAnimationFrame(render);
                    reject(e);
                }
            }, TICK_MS);

            let before = performance.now();
            (renderLoop = () => {
                try {
                    const now = performance.now(), dt = (now - before) / 1_000;
                    this.render(dt, resolve);
                    before = now;
                    render = requestAnimationFrame(renderLoop);
                } catch (e) {
                    clearInterval(interval);
                    cancelAnimationFrame(render);
                    reject(e);
                }
            })();
        });
    }
}
