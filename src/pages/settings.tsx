if (typeof window !== "undefined") {
    const search = window.location.search;
    const hash = window.location.hash;
    const target = search
        ? `./index.html${search}${hash ? hash : ""}`
        : `./index.html?settings=open${hash ? hash : ""}`;
    window.location.replace(target);
}
