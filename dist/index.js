"use strict";
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
window.addEventListener("load", function () {
    var _a, _b, _c, _d;
    var cookieConsent = document.getElementById("cookie-consent-container");
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
    (_d = document.getElementById("mailto")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function (event) {
        event.preventDefault();
        location.href = "mailto:".concat(atob("cm9iZXJ0QGh1c2VsaS51cw=="));
    });
    if (!cookieExists("cconsent")) {
        setDisplay(cookieConsent, "flex");
    }
});
//# sourceMappingURL=index.js.map