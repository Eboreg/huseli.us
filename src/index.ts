function setDisplay(elem: HTMLElement | null, display: string) {
    if (elem) elem.style.display = display;
}

function cookieExists(name: string) {
    return document.cookie.split(";").some((item) => item.trim().startsWith(`${name}=`));
}

function setCookieConsentCookie() {
    document.cookie = `cconsent=yes; max-age=${60*60*24*30}; domain=huseli.us; samesite=lax;`;
}

window.addEventListener("load", () => {
    const cookieConsent = document.getElementById("cookie-consent-container");

    document.getElementById("cookie-consent-yes")?.addEventListener("click", () => {
        setCookieConsentCookie();
        setDisplay(cookieConsent, "none");
    });

    document.getElementById("cookie-consent-maybe")?.addEventListener("click", () => {
        if (Math.random() >= 0.5) setCookieConsentCookie();
        setDisplay(cookieConsent, "none");
    });

    document.getElementById("cookie-consent-no")?.addEventListener("click", () => {
        setDisplay(cookieConsent, "none");
    });

    document.getElementById("mailto")?.addEventListener("click", (event) => {
        event.preventDefault();
        location.href = `mailto:${atob("cm9iZXJ0QGh1c2VsaS51cw==")}`;
    });

    if (!cookieExists("cconsent")) {
        setDisplay(cookieConsent, "flex");
    }
});
