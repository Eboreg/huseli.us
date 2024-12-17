let cookieConsentContainer: HTMLElement | null;
let scrollContainer: HTMLElement | null;
let scrollContent: string;
let isHandlingScroll = false;

function cookieExists(name: string) {
    return document.cookie.split(";").some((item) => item.trim().startsWith(`${name}=`));
}

function setCookieConsentCookie() {
    document.cookie = `cconsent=yes; max-age=${60*60*24*30}; domain=huseli.us; samesite=lax;`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onMailtoClick(event: Event) {
    event.preventDefault();
    location.href = `mailto:${atob("cm9iZXJ0QGh1c2VsaS51cw==")}`;
}

function onScroll() {
    if (!isHandlingScroll && scrollContainer && scrollContent) {
        isHandlingScroll = true;
        if (scrollContainer.scrollHeight - scrollContainer.offsetHeight - scrollContainer.scrollTop <= 300) {
            scrollContainer.innerHTML += scrollContent;
        }
        isHandlingScroll = false;
    }
}

function getKeyframeRule(name: string, keyText: string): CSSKeyframeRule | undefined {
    for (let idx = 0; idx < document.styleSheets.length; idx++) {
        const sheet = document.styleSheets.item(idx);

        if (sheet) {
            for (let idx2 = 0; idx2 < sheet.cssRules.length; idx2++) {
                const rule = sheet.cssRules.item(idx2);

                if (rule instanceof CSSKeyframesRule && rule.name == name) {
                    for (let idx3 = 0; idx3 < rule.cssRules.length; idx3++) {
                        const frameRule = rule.cssRules.item(idx3);
                        if (frameRule instanceof CSSKeyframeRule && frameRule.keyText == keyText) return frameRule;
                    }
                }
            }
        }
    }
    return;
}

function initCookieConsentAnimation() {
    const cookieConsent = cookieConsentContainer?.querySelector(".cookie-consent");
    const rule = getKeyframeRule("cookie-consent-container", "100%");

    if (cookieConsent && rule) {
        rule.style.paddingTop = `calc(100svh - ${cookieConsent.clientHeight}px)`;
    }
}

function hideCookieConsentContainer() {
    cookieConsentContainer?.classList.remove("shown");
    cookieConsentContainer?.classList.add("hide");
}

window.addEventListener("load", () => {
    cookieConsentContainer = document.getElementById("cookie-consent-container");
    scrollContainer = document.getElementById("scroll-container");

    cookieConsentContainer?.addEventListener("animationend", (event) => {
        if (cookieConsentContainer?.classList.contains("hide")) {
            cookieConsentContainer?.classList.remove("hide");
            cookieConsentContainer?.classList.add("hidden");
        }
    });

    document.getElementById("cookie-consent-yes")?.addEventListener("click", () => {
        setCookieConsentCookie();
        hideCookieConsentContainer();
    });

    document.getElementById("cookie-consent-maybe")?.addEventListener("click", () => {
        if (Math.random() >= 0.5) setCookieConsentCookie();
        hideCookieConsentContainer();
    });

    document.getElementById("cookie-consent-no")?.addEventListener("click", () => {
        hideCookieConsentContainer();
    });

    if (!cookieExists("cconsent")) {
        cookieConsentContainer?.classList.add("shown");
        try {
            initCookieConsentAnimation();
        } catch (error: any) {
            console.error(error);
        }
    }

    if (scrollContainer) {
        // @ts-expect-error Claims focusVisible does not exist
        scrollContainer.focus({ focusVisible: false });
        scrollContent = scrollContainer.innerHTML;

        if (scrollContainer.scrollHeight <= scrollContainer.offsetHeight) {
            scrollContainer.innerHTML += scrollContent;
        }

        scrollContainer.addEventListener("scroll", onScroll);
        scrollContainer.addEventListener("wheel", onScroll);
    }
});
