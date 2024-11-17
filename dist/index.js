"use strict";
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
window.addEventListener("load", function () {
    var _a, _b, _c;
    var cookieConsent = document.getElementById("cookie-consent-container");
    scrollContainer = document.getElementById("scroll-container");
    (_a = document.getElementById("cookie-consent-yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
        setCookieConsentCookie();
        setDisplay(cookieConsent, "none");
    });
    (_b = document.getElementById("cookie-consent-maybe")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
        if (Math.random() >= 0.5)
            setCookieConsentCookie();
        setDisplay(cookieConsent, "none");
    });
    (_c = document.getElementById("cookie-consent-no")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
        setDisplay(cookieConsent, "none");
    });
    if (!cookieExists("cconsent")) {
        setDisplay(cookieConsent, "flex");
    }
    if (scrollContainer) {
        scrollContainer.focus();
        scrollContent = scrollContainer.innerHTML;
        if (scrollContainer.scrollHeight <= scrollContainer.offsetHeight) {
            scrollContainer.innerHTML += scrollContent;
        }
        scrollContainer.addEventListener("scroll", onScroll);
        scrollContainer.addEventListener("wheel", onScroll);
    }
});
//# sourceMappingURL=index.js.map