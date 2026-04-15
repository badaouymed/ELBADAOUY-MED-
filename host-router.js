(function () {
  var hostname = (window.location.hostname || "").toLowerCase();
  var pathname = window.location.pathname || "/";

  function go(path) {
    if (pathname !== path) {
      window.location.replace(path);
    }
  }

  if (hostname === "cv.badaouy.me") {
    go("/cv.html");
    return;
  }

  if (hostname === "pf.badaouy.me") {
    go("/construction.html");
  }
})();
