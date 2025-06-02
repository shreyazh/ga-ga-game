<script>
    import { onMount } from "svelte";
    import { setupMainCtx, setupUiCtx } from "./lib/render";
    import { listenKeys } from "./lib/input";
    import { start } from "./lib/scenes/start.scene";
    import bgAudio from "./assets/mp3/calmtheme.mp3";
    import bloodUrl from "./assets/png/sprites/ui/blud.png";

    /** @type HTMLCanvasElement */
    let canvas, uiCanvas, audio;
    export let bloodElem;

    onMount(async () => {
        setupMainCtx(canvas);
        setupUiCtx(canvas);
        audio.play();

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        uiCanvas.width = window.innerWidth;
        uiCanvas.height = window.innerHeight;
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            uiCanvas.width = window.innerWidth;
            uiCanvas.height = window.innerHeight;
        });

        listenKeys();

        for (
            let data = {}, nextScene = start;
            !!nextScene;
            [data, nextScene] = await nextScene.run(data)
        );
    });
</script>


<canvas bind:this={canvas}></canvas>
<canvas bind:this={uiCanvas} class="ui"></canvas>

<audio loop autoplay bind:this={audio}>
    <source src={bgAudio} type="audio/mp3" />
</audio>
<img src={bloodUrl}/><p bind:this={bloodElem}></p>

<style>
    canvas {
        background-image: url("bg.png");
        background-repeat: repeat;
        margin: 0;
        z-index: -1;
    }

    .ui {
        position: absolute;
        background-color: transparent;
        z-index: 1;
    }
</style>
