let isHandlingScroll = false;

class CookieConsent {
    elem: HTMLElement;
    container: HTMLElement;
    cssAnimations: { horizontal?: CSSAnimation; vertical?: CSSAnimation; left: number; top: number };
    followAnimation?: Animation;
    lastMouseMoveCallbackTime = 0;
    mouseMoveTimeout?: number;

    constructor(elem: HTMLElement, container: HTMLElement) {
        this.elem = elem;
        this.container = container;
        this.cssAnimations = { left: 0, top: 0 };

        this.elem.addEventListener(
            "animationstart",
            () => {
                this.elem.getAnimations().forEach((a) => {
                    if (a instanceof CSSAnimation) {
                        if (a.animationName === "cookie-consent-horizontal") {
                            this.cssAnimations.horizontal = a;
                        } else if (a.animationName === "cookie-consent-vertical") {
                            this.cssAnimations.vertical = a;
                        }
                    }
                });
            },
            { passive: true, once: true },
        );

        this.container.addEventListener(
            "animationend",
            () => {
                if (this.container.classList.contains("hide")) {
                    this.container.classList.remove("hide");
                    this.container.classList.add("hidden");
                    this.cancelCSSAnimations();
                    this.followAnimation?.cancel();
                }
            },
            { passive: true },
        );

        this.elem.addEventListener("mouseenter", this.onElemMouseEnter.bind(this), { passive: true });

        this.container.addEventListener(
            "mousemove",
            (event: MouseEvent) => {
                if (event.target === this.container) {
                    clearTimeout(this.mouseMoveTimeout);

                    if (Date.now() - this.lastMouseMoveCallbackTime > 500) {
                        this.onContainerMouseMove(event);
                    } else {
                        const remaining = getRemainingAnimationTime(this.followAnimation);

                        if (
                            remaining !== undefined &&
                            remaining < 500 &&
                            this.followAnimation?.playState === "running"
                        ) {
                            this.onContainerMouseMove(event);
                        } else {
                            this.mouseMoveTimeout = setTimeout(this.onContainerMouseMove.bind(this), 500, event);
                        }
                    }
                }
            },
            { passive: true },
        );

        document.getElementById("cookie-consent-yes")?.addEventListener(
            "click",
            () => {
                this.setCookie();
                this.hideContainer();
            },
            { passive: true },
        );

        document.getElementById("cookie-consent-maybe")?.addEventListener(
            "click",
            () => {
                if (Math.random() >= 0.5) this.setCookie();
                this.hideContainer();
            },
            { passive: true },
        );

        document
            .getElementById("cookie-consent-no")
            ?.addEventListener("click", this.hideContainer.bind(this), { passive: true });

        if (!cookieExists("cconsent")) {
            this.container.classList.add("shown");
        }
    }

    cancelCSSAnimations(left?: number, top?: number) {
        if (left) this.cssAnimations.left = left;
        if (top) this.cssAnimations.top = top;
        this.cssAnimations.horizontal?.cancel();
        this.cssAnimations.vertical?.cancel();
    }

    hideContainer() {
        this.container.classList.remove("shown");
        this.container.classList.add("hide");
    }

    leftToIterationStart(): number {
        // Distance from document edge to centered 90% width element edge:
        const offset = document.body.clientWidth * 0.05;
        const maxLeft = offset * 2;
        return (this.cssAnimations.left + offset) / maxLeft;
    }

    onContainerMouseMove(event: MouseEvent) {
        this.lastMouseMoveCallbackTime = Date.now();

        const top = this.yToElemTop(event.y);
        const left = this.xToElemLeft(event.x);
        const currentStyle = getComputedStyle(this.elem);
        const maxDistance = getDistance(0, 0, document.body.clientWidth, document.body.clientHeight);
        const distance = getDistance(currentStyle.left, currentStyle.top, left, top);
        const duration = Math.min(10000 * (distance / maxDistance), 1000);
        const keyframes = new KeyframeEffect(
            this.elem,
            [
                { top: currentStyle.top, left: currentStyle.left },
                { top: `${top}px`, left: `${left}px` },
            ],
            { duration },
        );
        const animation = new Animation(keyframes);

        animation.addEventListener("finish", this.resumeCSSAnimations.bind(this), { passive: true, once: true });
        this.cancelCSSAnimations(left, top);
        this.followAnimation?.cancel();
        this.followAnimation = animation;
        this.followAnimation.play();
    }

    onElemMouseEnter(event: MouseEvent) {
        this.cssAnimations.left = this.xToElemLeft(event.x);
        this.cssAnimations.top = this.yToElemTop(event.y);
        this.resumeCSSAnimations();
    }

    resumeCSSAnimations() {
        if (this.cssAnimations.horizontal && this.cssAnimations.vertical) {
            this.followAnimation?.cancel();

            this.cssAnimations.horizontal.effect?.updateTiming({
                iterationStart: this.leftToIterationStart(),
            });
            this.cssAnimations.vertical.effect?.updateTiming({
                iterationStart: this.topToIterationStart(),
            });
            this.cssAnimations.horizontal.play();
            this.cssAnimations.vertical.play();
        }
    }

    setCookie() {
        document.cookie = `cconsent=yes; max-age=${60 * 60 * 24 * 30}; domain=huseli.us; samesite=lax;`;
    }

    topToIterationStart(): number {
        const maxTop = document.body.clientHeight - 190;
        return this.cssAnimations.top / maxTop;
    }

    xToElemLeft(x: number): number {
        const offset = document.body.clientWidth * 0.05;
        const fraction = x / document.body.clientWidth;
        const maxLeft = offset * 2;

        return fraction * maxLeft - offset;
    }

    yToElemTop(y: number): number {
        const maxTop = document.body.clientHeight - 190;
        const fraction = y / document.body.clientHeight;
        return maxTop * fraction;
    }
}

function coerceFloat(value: string | number): number {
    return typeof value === "string" ? parseFloat(value) : value;
}

function cookieExists(name: string) {
    return document.cookie.split(";").some((item) => item.trim().startsWith(`${name}=`));
}

function getDistance(x1: string | number, y1: string | number, x2: string | number, y2: string | number): number {
    return Math.sqrt(
        Math.pow(Math.abs(coerceFloat(y1) - coerceFloat(y2)), 2) +
            Math.pow(Math.abs(coerceFloat(x1) - coerceFloat(x2)), 2),
    );
}

function getRemainingAnimationTime(animation?: Animation): number | undefined {
    const timing = animation?.effect?.getComputedTiming();

    if (typeof timing?.activeDuration === "number" && typeof timing?.localTime === "number") {
        return timing.activeDuration - timing.localTime;
    }

    return undefined;
}

function onMailtoClick(event: Event) {
    event.preventDefault();
    location.href = `mailto:${atob("cm9iZXJ0QGh1c2VsaS51cw==")}`;
}

function onScroll(container: HTMLElement, content: string) {
    if (!isHandlingScroll && content) {
        isHandlingScroll = true;
        if (container.scrollHeight - container.offsetHeight - container.scrollTop <= 300) {
            container.innerHTML += content;
        }
        isHandlingScroll = false;
    }
}

window.addEventListener(
    "load",
    () => {
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
    },
    { passive: true },
);
