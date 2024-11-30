"use strict";
var cookieConsentContainer;
var scrollContainer;
var scrollContent;
var isHandlingScroll = false;
function setDisplay(elem, display) {
    if (elem)
        elem.style.display = display;
}
function cookieExists(name) {
    return document.cookie.split(";").some(function (item) { return item.trim().startsWith("".concat(name, "=")); });
}
function setCookieConsentCookie() {
    document.cookie = "cconsent=yes; max-age=".concat(60 * 60 * 24 * 30, "; domain=huseli.us; samesite=lax;");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onMailtoClick(event) {
    event.preventDefault();
    location.href = "mailto:".concat(atob("cm9iZXJ0QGh1c2VsaS51cw=="));
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
    for (var idx = 0; idx < document.styleSheets.length; idx++) {
        var sheet = document.styleSheets.item(idx);
        if (sheet) {
            for (var idx2 = 0; idx2 < sheet.cssRules.length; idx2++) {
                var rule = sheet.cssRules.item(idx2);
                if (rule instanceof CSSKeyframesRule && rule.name == name) {
                    for (var idx3 = 0; idx3 < rule.cssRules.length; idx3++) {
                        var frameRule = rule.cssRules.item(idx3);
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
    var cookieConsent = cookieConsentContainer === null || cookieConsentContainer === void 0 ? void 0 : cookieConsentContainer.querySelector(".cookie-consent");
    var rule = getKeyframeRule("cookie-consent-container", "100%");
    if (cookieConsent && rule) {
        rule.style.paddingTop = "calc(100svh - ".concat(cookieConsent.clientHeight, "px)");
    }
}
window.addEventListener("load", function () {
    var _a, _b, _c;
    cookieConsentContainer = document.getElementById("cookie-consent-container");
    scrollContainer = document.getElementById("scroll-container");
    (_a = document.getElementById("cookie-consent-yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
        setCookieConsentCookie();
        setDisplay(cookieConsentContainer, "none");
    });
    (_b = document.getElementById("cookie-consent-maybe")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
        if (Math.random() >= 0.5)
            setCookieConsentCookie();
        setDisplay(cookieConsentContainer, "none");
    });
    (_c = document.getElementById("cookie-consent-no")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
        setDisplay(cookieConsentContainer, "none");
    });
    if (!cookieExists("cconsent")) {
        setDisplay(cookieConsentContainer, "flex");
        try {
            initCookieConsentAnimation();
        }
        catch (_) { }
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