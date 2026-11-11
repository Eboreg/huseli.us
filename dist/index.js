"use strict";
let isHandlingScroll = false;
class CookieConsent {
    constructor(elem, container) {
        var _a, _b, _c;
        this.elem = elem;
        this.container = container;
        this.cssAnimations = {};
        this.elem.addEventListener("animationstart", () => {
            this.elem.getAnimations().forEach((a) => {
                if (a instanceof CSSAnimation) {
                    if (a.animationName === "cookie-consent-horizontal") {
                        this.cssAnimations.horizontal = a;
                    }
                    else if (a.animationName === "cookie-consent-vertical") {
                        this.cssAnimations.vertical = a;
                    }
                }
            });
        }, { passive: true, once: true });
        this.container.addEventListener("mousemove", (event) => {
            if (event.target === this.container)
                this.mouseMoveEvent = event;
        }, { passive: true });
        (_a = document.getElementById("cookie-consent-yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            this.setCookie();
            this.hide();
        }, { passive: true });
        (_b = document.getElementById("cookie-consent-maybe")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            if (Math.random() >= 0.5)
                this.setCookie();
            this.hide();
        }, { passive: true });
        (_c = document
            .getElementById("cookie-consent-no")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.hide.bind(this), { passive: true });
        if (!cookieExists("cconsent")) {
            this.container.classList.add("shown");
            this.pollId = setInterval(this.poll.bind(this), 500);
        }
    }
    cancelCSSAnimations() {
        var _a, _b;
        (_a = this.cssAnimations.horizontal) === null || _a === void 0 ? void 0 : _a.cancel();
        (_b = this.cssAnimations.vertical) === null || _b === void 0 ? void 0 : _b.cancel();
    }
    cancelFollowAnimation() {
        var _a;
        (_a = this.followAnimation) === null || _a === void 0 ? void 0 : _a.cancel();
    }
    createFollowAnimation(start, end) {
        const maxDistance = getDistance({ x: document.body.clientWidth, y: document.body.clientHeight });
        const distance = getDistance(start, end);
        const duration = Math.min(10000 * (distance / maxDistance), 1000);
        const keyframes = new KeyframeEffect(this.elem, [this.positionToKeyFrame(start), this.positionToKeyFrame(end)], { duration });
        const animation = new Animation(keyframes);
        animation.addEventListener("finish", () => {
            this.cancelFollowAnimation();
            this.resumeCSSAnimations();
        }, { passive: true, once: true });
        return animation;
    }
    getDirection(start, end) {
        return {
            x: start.x < end.x ? "right" : "left",
            y: start.y < end.y ? "down" : "up",
        };
    }
    hide() {
        this.container.addEventListener("animationend", () => {
            if (this.container.classList.contains("hide")) {
                this.container.classList.remove("hide");
                this.container.classList.add("hidden");
                this.cancelCSSAnimations();
                this.cancelFollowAnimation();
                clearInterval(this.pollId);
            }
        }, { passive: true });
        this.container.classList.remove("shown");
        this.container.classList.add("hide");
    }
    isCSSAnimationsRunning() {
        var _a, _b;
        return (((_a = this.cssAnimations.horizontal) === null || _a === void 0 ? void 0 : _a.playState) === "running" ||
            ((_b = this.cssAnimations.vertical) === null || _b === void 0 ? void 0 : _b.playState) === "running");
    }
    isFollowAnimationRunning() {
        var _a;
        return ((_a = this.followAnimation) === null || _a === void 0 ? void 0 : _a.playState) === "running";
    }
    leftToIterationStart(left) {
        var _a;
        const maxLeft = document.body.clientWidth - this.elem.clientWidth;
        const start = coerceFloat(left) / maxLeft;
        if (((_a = this.followAnimationDirection) === null || _a === void 0 ? void 0 : _a.x) === "left")
            return 2 - start;
        return start;
    }
    poll() {
        var _a;
        const mouseMoveEvent = this.mouseMoveEvent;
        this.mouseMoveEvent = undefined;
        if (mouseMoveEvent) {
            const end = this.xyToElemPosition(mouseMoveEvent.x, mouseMoveEvent.y);
            const currentStyle = getComputedStyle(this.elem);
            // Important to freeze these values before cancelling animations:
            const start = { x: coerceFloat(currentStyle.left), y: coerceFloat(currentStyle.top) };
            this.cancelCSSAnimations();
            this.cancelFollowAnimation();
            this.elem.style.left = `${end.x}px`;
            this.elem.style.top = `${end.y}px`;
            this.elem.classList.add("flash");
            this.followAnimationDirection = this.getDirection(start, end);
            this.followAnimation = this.createFollowAnimation(start, end);
            this.followAnimation.play();
        }
        else if (!this.isFollowAnimationRunning() && !this.isCSSAnimationsRunning()) {
            if (((_a = this.followAnimation) === null || _a === void 0 ? void 0 : _a.playState) === "paused") {
                // Don't know why this happens.
                this.cancelFollowAnimation();
            }
            this.resumeCSSAnimations();
        }
    }
    positionToKeyFrame(pos) {
        return { top: `${pos.y}px`, left: `${pos.x}px` };
    }
    resumeCSSAnimations() {
        var _a, _b;
        if (this.cssAnimations.horizontal && this.cssAnimations.vertical) {
            const currentStyle = getComputedStyle(this.elem);
            (_a = this.cssAnimations.horizontal.effect) === null || _a === void 0 ? void 0 : _a.updateTiming({
                iterationStart: this.leftToIterationStart(currentStyle.left),
            });
            (_b = this.cssAnimations.vertical.effect) === null || _b === void 0 ? void 0 : _b.updateTiming({
                iterationStart: this.topToIterationStart(currentStyle.top),
            });
            this.elem.classList.remove("flash");
            this.cssAnimations.horizontal.play();
            this.cssAnimations.vertical.play();
        }
    }
    setCookie() {
        document.cookie = `cconsent=yes; max-age=${60 * 60 * 24 * 30}; domain=huseli.us; samesite=lax;`;
    }
    topToIterationStart(top) {
        var _a;
        const maxTop = document.body.clientHeight - this.elem.clientHeight;
        const start = coerceFloat(top) / maxTop;
        if (((_a = this.followAnimationDirection) === null || _a === void 0 ? void 0 : _a.y) === "up")
            return 2 - start;
        return start;
    }
    xyToElemPosition(x, y) {
        const maxLeft = document.body.clientWidth - this.elem.clientWidth;
        const widthFraction = x / document.body.clientWidth;
        const maxTop = document.body.clientHeight - this.elem.clientHeight;
        const heightFraction = y / document.body.clientHeight;
        return { x: widthFraction * maxLeft, y: heightFraction * maxTop };
    }
}
function coerceFloat(value) {
    return typeof value === "string" ? parseFloat(value) : value;
}
function cookieExists(name) {
    return document.cookie.split(";").some((item) => item.trim().startsWith(`${name}=`));
}
function getDistance(pos1, pos2) {
    pos2 = pos2 !== null && pos2 !== void 0 ? pos2 : { x: 0, y: 0 };
    return Math.sqrt(Math.pow(Math.abs(pos1.y - pos2.y), 2) + Math.pow(Math.abs(pos1.x - pos2.x), 2));
}
function onMailtoClick(event) {
    event.preventDefault();
    location.href = `mailto:${atob("cm9iZXJ0QGh1c2VsaS51cw==")}`;
}
function onScroll(container, content) {
    if (!isHandlingScroll && content) {
        isHandlingScroll = true;
        if (container.scrollHeight - container.offsetHeight - container.scrollTop <= 300) {
            container.innerHTML += content;
        }
        isHandlingScroll = false;
    }
}
window.addEventListener("load", () => {
    const cookieConsent = document.getElementById("cookie-consent");
    const cookieConsentContainer = document.getElementById("cookie-consent-container");
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
        const scrollContent = scrollContainer.innerHTML;
        scrollContainer.focus({ focusVisible: false });
        if (scrollContainer.scrollHeight <= scrollContainer.offsetHeight) {
            scrollContainer.innerHTML += scrollContent;
        }
        scrollContainer.addEventListener("scroll", () => onScroll(scrollContainer, scrollContent), {
            passive: true,
        });
        scrollContainer.addEventListener("wheel", () => onScroll(scrollContainer, scrollContent), {
            passive: true,
        });
    }
    if (cookieConsent && cookieConsentContainer) {
        new CookieConsent(cookieConsent, cookieConsentContainer);
    }
}, { passive: true });
//# sourceMappingURL=index.js.map