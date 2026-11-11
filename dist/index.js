"use strict";
let isHandlingScroll = false;
class CookieConsent {
    constructor(elem, container) {
        var _a, _b, _c;
        this.lastMouseMoveCallbackTime = 0;
        this.elem = elem;
        this.container = container;
        this.cssAnimations = { left: 0, top: 0 };
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
        this.container.addEventListener("animationend", () => {
            var _a;
            if (this.container.classList.contains("hide")) {
                this.container.classList.remove("hide");
                this.container.classList.add("hidden");
                this.cancelCSSAnimations();
                (_a = this.followAnimation) === null || _a === void 0 ? void 0 : _a.cancel();
            }
        }, { passive: true });
        this.elem.addEventListener("mouseenter", this.onElemMouseEnter.bind(this), { passive: true });
        this.container.addEventListener("mousemove", (event) => {
            var _a;
            if (event.target === this.container) {
                clearTimeout(this.mouseMoveTimeout);
                if (Date.now() - this.lastMouseMoveCallbackTime > 500) {
                    this.onContainerMouseMove(event);
                }
                else {
                    const remaining = getRemainingAnimationTime(this.followAnimation);
                    if (remaining !== undefined &&
                        remaining < 500 &&
                        ((_a = this.followAnimation) === null || _a === void 0 ? void 0 : _a.playState) === "running") {
                        this.onContainerMouseMove(event);
                    }
                    else {
                        this.mouseMoveTimeout = setTimeout(this.onContainerMouseMove.bind(this), 500, event);
                    }
                }
            }
        }, { passive: true });
        (_a = document.getElementById("cookie-consent-yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            this.setCookie();
            this.hideContainer();
        }, { passive: true });
        (_b = document.getElementById("cookie-consent-maybe")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            if (Math.random() >= 0.5)
                this.setCookie();
            this.hideContainer();
        }, { passive: true });
        (_c = document
            .getElementById("cookie-consent-no")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.hideContainer.bind(this), { passive: true });
        if (!cookieExists("cconsent")) {
            this.container.classList.add("shown");
        }
    }
    cancelCSSAnimations(left, top) {
        var _a, _b;
        if (left)
            this.cssAnimations.left = left;
        if (top)
            this.cssAnimations.top = top;
        (_a = this.cssAnimations.horizontal) === null || _a === void 0 ? void 0 : _a.cancel();
        (_b = this.cssAnimations.vertical) === null || _b === void 0 ? void 0 : _b.cancel();
    }
    hideContainer() {
        this.container.classList.remove("shown");
        this.container.classList.add("hide");
    }
    leftToIterationStart() {
        // Distance from document edge to centered 90% width element edge:
        const offset = document.body.clientWidth * 0.05;
        const maxLeft = offset * 2;
        return (this.cssAnimations.left + offset) / maxLeft;
    }
    onContainerMouseMove(event) {
        var _a;
        this.lastMouseMoveCallbackTime = Date.now();
        const top = this.yToElemTop(event.y);
        const left = this.xToElemLeft(event.x);
        const currentStyle = getComputedStyle(this.elem);
        const maxDistance = getDistance(0, 0, document.body.clientWidth, document.body.clientHeight);
        const distance = getDistance(currentStyle.left, currentStyle.top, left, top);
        const duration = Math.min(10000 * (distance / maxDistance), 1000);
        const keyframes = new KeyframeEffect(this.elem, [
            { top: currentStyle.top, left: currentStyle.left },
            { top: `${top}px`, left: `${left}px` },
        ], { duration });
        const animation = new Animation(keyframes);
        animation.addEventListener("finish", this.resumeCSSAnimations.bind(this), { passive: true, once: true });
        this.cancelCSSAnimations(left, top);
        (_a = this.followAnimation) === null || _a === void 0 ? void 0 : _a.cancel();
        this.followAnimation = animation;
        this.followAnimation.play();
    }
    onElemMouseEnter(event) {
        this.cssAnimations.left = this.xToElemLeft(event.x);
        this.cssAnimations.top = this.yToElemTop(event.y);
        this.resumeCSSAnimations();
    }
    resumeCSSAnimations() {
        var _a, _b, _c;
        if (this.cssAnimations.horizontal && this.cssAnimations.vertical) {
            (_a = this.followAnimation) === null || _a === void 0 ? void 0 : _a.cancel();
            (_b = this.cssAnimations.horizontal.effect) === null || _b === void 0 ? void 0 : _b.updateTiming({
                iterationStart: this.leftToIterationStart(),
            });
            (_c = this.cssAnimations.vertical.effect) === null || _c === void 0 ? void 0 : _c.updateTiming({
                iterationStart: this.topToIterationStart(),
            });
            this.cssAnimations.horizontal.play();
            this.cssAnimations.vertical.play();
        }
    }
    setCookie() {
        document.cookie = `cconsent=yes; max-age=${60 * 60 * 24 * 30}; domain=huseli.us; samesite=lax;`;
    }
    topToIterationStart() {
        const maxTop = document.body.clientHeight - 190;
        return this.cssAnimations.top / maxTop;
    }
    xToElemLeft(x) {
        const offset = document.body.clientWidth * 0.05;
        const fraction = x / document.body.clientWidth;
        const maxLeft = offset * 2;
        return fraction * maxLeft - offset;
    }
    yToElemTop(y) {
        const maxTop = document.body.clientHeight - 190;
        const fraction = y / document.body.clientHeight;
        return maxTop * fraction;
    }
}
function coerceFloat(value) {
    return typeof value === "string" ? parseFloat(value) : value;
}
function cookieExists(name) {
    return document.cookie.split(";").some((item) => item.trim().startsWith(`${name}=`));
}
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(coerceFloat(y1) - coerceFloat(y2)), 2) +
        Math.pow(Math.abs(coerceFloat(x1) - coerceFloat(x2)), 2));
}
function getRemainingAnimationTime(animation) {
    var _a;
    const timing = (_a = animation === null || animation === void 0 ? void 0 : animation.effect) === null || _a === void 0 ? void 0 : _a.getComputedTiming();
    if (typeof (timing === null || timing === void 0 ? void 0 : timing.activeDuration) === "number" && typeof (timing === null || timing === void 0 ? void 0 : timing.localTime) === "number") {
        return timing.activeDuration - timing.localTime;
    }
    return undefined;
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