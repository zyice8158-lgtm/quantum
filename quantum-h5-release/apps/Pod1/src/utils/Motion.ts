import { BarStore } from "@/store/bar";
import { updataAcrylic, updateWindowSize } from "@/store/window";
import { nextAnimationFrame } from "@quantum/use";
import { animate, cubicBezier } from "animejs";

export interface WindowSize {
    Width: number;
    Height: number;
}

interface AcrylicRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ResizeWindowParams {
    // 整个 WebView
    windowSize: WindowSize;
    // 亚克力
    acrylicRect: AcrylicRect;
    areaName?: string;
    startWidth?: number;
    duration?: number;
}

export const motionResizeWindow = async (
    params: ResizeWindowParams
): Promise<void> => {
    const {
        windowSize,
        acrylicRect,
        areaName = "Main",
        startWidth,
        duration = 2000,
    } = params;

    const { Width, Height } = windowSize;
    const { x, y, width, height } = acrylicRect;

    const finalStartWidth: number = startWidth ?? width;

    const isShrink: boolean =
        startWidth !== undefined && startWidth > width;

    if (isShrink) {
        await updataAcrylic({
            Name: areaName,
            Width: width,
            Height: height,
            StartWidth: finalStartWidth,
            StartHeight: height,
            PointX: x,
            PointY: y,
            CornerRadius: 32,
            TransitionDuration: duration,
            TransitionTiming: [0.25, 0.1, 0.25, 1.0],
            TransformOrigin: [0.5, 0.5],
        });

        await nextAnimationFrame();

        await updateWindowSize({
            Width,
            Height,
        });
    } else {
        await updateWindowSize({
            Width,
            Height,
        });

        await nextAnimationFrame();

        await updataAcrylic({
            Name: areaName,
            Width: width,
            Height: height,
            StartWidth: finalStartWidth,
            StartHeight: height,
            PointX: x,
            PointY: y,
            CornerRadius: 32,
            TransitionDuration: duration,
            TransitionTiming: [0.25, 0.1, 0.25, 1.0],
            TransformOrigin: [0.5, 0.5],
        });
    }
};

export interface ElementSize {
    width: number;
    height: number;
}


/**
* 基础形变动画：从上一页尺寸 → 当前元素真实尺寸
* 只做 自身的宽高/居中动画
*/
// 动画时间
const TIME_DURATION = 500;
const routeEase = cubicBezier(0.25, 0.1, 0.25, 1.0);
export const animateSizeMorph = async (target: HTMLElement, fromSize: ElementSize, width?:[number],height?:[number]): Promise<void> => {
    const toRect = target.getBoundingClientRect();
    const toWidth = toRect.width;
    const toHeight = toRect.height;
    width = width ?? [toWidth];
    height = height ?? [toHeight];

    if (toWidth === 0 || toHeight === 0) {
        return;
    }

    const computedStyle = window.getComputedStyle(target);
    const originMarginLeft = parseFloat(computedStyle.marginLeft || "0");

    const deltaWidth = toWidth - fromSize.width;
    const startMarginLeft = originMarginLeft + deltaWidth / 2;

    target.style.width = `${fromSize.width}px`;
    target.style.height = `${fromSize.height}px`;
    target.style.marginLeft = startMarginLeft > 0 ? `${startMarginLeft}px` : "0px";
    target.style.overflow = "hidden";
    BarStore.isAanimateChange = true;
    await animate(target, {
        width,
        height,
        marginLeft: originMarginLeft,
        duration: TIME_DURATION,
        easing: routeEase,
    })
    target.style.width = "";
    target.style.height = "";
    target.style.marginLeft = "";
    target.style.overflow = "";
    BarStore.isAanimateChange = false;
};