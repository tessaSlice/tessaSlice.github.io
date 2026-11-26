(function () {
    const dialog = document.getElementById("project-image-modal");
    const preview = dialog && dialog.querySelector("img");
    const close = dialog && dialog.querySelector(".image-modal-close");
    if (!(dialog instanceof HTMLDialogElement) || !(preview instanceof HTMLImageElement)) return;

    function fitPreview() {
        if (!preview.naturalWidth) return;
        const ratio = preview.naturalWidth / preview.naturalHeight;
        let width = window.innerWidth;
        let height = width / ratio;
        if (height > window.innerHeight) {
            height = window.innerHeight;
            width = height * ratio;
        }
        preview.style.width = width + "px";
        preview.style.height = height + "px";
    }

    document.querySelectorAll(".project-image").forEach((button) => {
        button.addEventListener("click", () => {
            const source = button.querySelector("img");
            if (!(source instanceof HTMLImageElement)) return;
            preview.src = source.currentSrc || source.src;
            const label = button.getAttribute("aria-label") || "";
            preview.alt = label.replace(/^View full size:\s*/, "");
            if (preview.complete) fitPreview();
            dialog.showModal();
        });
    });

    preview.addEventListener("load", fitPreview);
    window.addEventListener("resize", () => {
        if (dialog.open) fitPreview();
    });
    if (close) {
        close.addEventListener("click", () => dialog.close());
    }
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });
})();
