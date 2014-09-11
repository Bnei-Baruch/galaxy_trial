define(['erizo'], function () {
    "use strict";
    // Monkey-patching Erizo player to disable control bar display
    Erizo.Bar = function () {this.display = this.hide = function () {};};
});
