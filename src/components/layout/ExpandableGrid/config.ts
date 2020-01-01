import { InterpolationWithTheme } from "@emotion/core";

export const defaultSpringSettings = {
    y: 0,
    x: 0,
    scaleX: 1,
    scaleY: 1,
    config: { tension: 500, friction: 50 },
};

export const bounceConfig = { tension: 500, friction: 30 };

export const getSelectedCss = (height: number) =>
    ({
        position: "fixed",
        top: `calc(${height / 2}px - 50vw)`,
        left: 0,
        height: "100vw",
        width: "100vw",
        justifyContent: "center",
        touchAction: "none",
    } as InterpolationWithTheme<any>);
