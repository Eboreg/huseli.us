let scrollContainer: HTMLElement | null;
let scrollContent: string;
let isHandlingScroll = false;

function setDisplay(elem: HTMLElement | null, display: string) {
    if (elem) elem.style.display = display;
}

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

window.addEventListener("load", () => {
    const cookieConsent = document.getElementById("cookie-consent-container");
    scrollContainer = document.getElementById("scroll-container");

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

    if (!cookieExists("cconsent")) {
        setDisplay(cookieConsent, "flex");
    }

    if (scrollContainer) {
        // @ts-expect-error apan ap
        scrollContainer.focus({ focusVisible: false });
        scrollContent = scrollContainer.innerHTML;

        if (scrollContainer.scrollHeight <= scrollContainer.offsetHeight) {
            scrollContainer.innerHTML += scrollContent;
        }

        scrollContainer.addEventListener("scroll", onScroll);
        scrollContainer.addEventListener("wheel", onScroll);
    }
});
