"use strict";
let cookieConsentContainer;
let scrollContainer;
let scrollContent;
let isHandlingScroll = false;
function cookieExists(name) {
    return document.cookie.split(";").some((item) => item.trim().startsWith(`${name}=`));
}
function setCookieConsentCookie() {
    document.cookie = `cconsent=yes; max-age=${60 * 60 * 24 * 30}; domain=huseli.us; samesite=lax;`;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onMailtoClick(event) {
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
function getKeyframeRule(name, keyText) {
    for (let idx = 0; idx < document.styleSheets.length; idx++) {
        const sheet = document.styleSheets.item(idx);
        if (sheet) {
            for (let idx2 = 0; idx2 < sheet.cssRules.length; idx2++) {
                const rule = sheet.cssRules.item(idx2);
                if (rule instanceof CSSKeyframesRule && rule.name == name) {
                    for (let idx3 = 0; idx3 < rule.cssRules.length; idx3++) {
                        const frameRule = rule.cssRules.item(idx3);
                        if (frameRule instanceof CSSKeyframeRule && frameRule.keyText == keyText)
                            return frameRule;
                    }
                }
            }
        }
    }
    return;
}
function initCookieConsentAnimation() {
    const cookieConsent = cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.querySelector(".cookie-consent");
    const rule = getKeyframeRule("cookie-consent-container", "100%");
    if (cookieConsent && rule) {
        rule.style.paddingTop = `calc(100svh - ${cookieConsent.clientHeight}px)`;
    }
}
function hideCookieConsentContainer() {
    cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.classList.remove("shown");
    cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.classList.add("hide");
}
window.addEventListener("load", () => {
    var _a, _b, _c;
    cookieConsentContainer = document.getElementById("cookie-consent-container");
    scrollContainer = document.getElementById("scroll-container");
    cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.addEventListener("animationend", (event) => {
        if (cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.classList.contains("hide")) {
            cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.classList.remove("hide");
            cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.classList.add("hidden");
        }
    });
    (_a = document.getElementById("cookie-consent-yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        setCookieConsentCookie();
        hideCookieConsentContainer();
    });
    (_b = document.getElementById("cookie-consent-maybe")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        if (Math.random() >= 0.5)
            setCookieConsentCookie();
        hideCookieConsentContainer();
    });
    (_c = document.getElementById("cookie-consent-no")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        hideCookieConsentContainer();
    });
    if (!cookieExists("cconsent")) {
        cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.classList.add("shown");
        try {
            initCookieConsentAnimation();
        }
        catch (error) {
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
//# sourceMappingURL=index.js.map