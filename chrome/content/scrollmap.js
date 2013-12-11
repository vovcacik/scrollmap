/* Privileged code. */

var scrollmap = {
    ADDON_ID: "scrollmap@vovcacik.addons.mozilla.org",
    Services: {},
    init: function() {
        // Load services.
        XPCOMUtils.defineLazyServiceGetter(this.Services, "css",
            "@mozilla.org/content/style-sheet-service;1",
            "nsIStyleSheetService");
        XPCOMUtils.defineLazyServiceGetter(this.Services, "io",
            "@mozilla.org/network/io-service;1",
            "nsIIOService");

        // Hook listeners.
        document.addEventListener(this.ADDON_ID + "#_drawWindow", this, false, true);

        // Register CSS.
        this._sheetURI = this.Services.io.newURI("chrome://scrollmap/content/scrollmap.css", null, null);
        if (!this.Services.css.sheetRegistered(this._sheetURI, this.Services.css.AGENT_SHEET))
            this.Services.css.loadAndRegisterSheet(this._sheetURI, this.Services.css.AGENT_SHEET);
    },
    handleEvent: function(event) {
        if (event.type === this.ADDON_ID + "#_drawWindow") {
            try {
                this._drawWindow(event.originalTarget);
            } catch(e) {
                event.preventDefault();
            }
        }
    },
    /**
     * Draws minified screenshot of whole document which is the owner document
     * of supplied canvas element.
     * @throws error when drawing could not be done or failed.
     */
    _drawWindow: function(canvas) {
        var doc = canvas.ownerDocument;
        if (!doc || !doc.body) throw new Error("The owner document for canvas or its body is missing.");
        var win = doc.defaultView;
        if (!win) throw new Error("The window instance for canvas is missing.");

        // Update CSS dimension to match document scale.
        var scale = canvas.clientWidth / doc.body.scrollWidth;
        canvas.style.height = Math.ceil(scale * doc.body.scrollHeight) + "px";

        // Update XUL dimension to match CSS dimension to avoid distortion on screen.
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        var context = canvas.getContext("2d");
        context.save();

        // Downscale drawing to fit canvas size without overflow.
        context.scale(canvas.width / doc.body.scrollWidth,
                      canvas.height / doc.body.scrollHeight);

        /*
         * Draw the window contents to the canvas.
         * @see http://dxr.mozilla.org/mozilla-central/source/dom/interfaces/canvas/nsIDOMCanvasRenderingContext2D.idl
         */
        context.drawWindow(win, 0, 0, doc.body.scrollWidth, doc.body.scrollHeight, "white");

        context.restore();
    }
}

window.addEventListener("load", function onload() {
    scrollmap.init();
    window.removeEventListener("load", onload);
});
