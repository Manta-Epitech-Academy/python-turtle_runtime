/* Tortue Python: a one-page runtime that runs Python with Skulpt and draws with
 * its turtle module. It knows nothing about the workshop platform: standalone it
 * is a tiny turtle playground, and the platform's adapter talks to the small
 * `window.PythonTurtle` API below. See README.md. */
(function () {
  "use strict";
  var STORAGE_KEY = "python-turtle-code";       // autosaved code (the platform snapshots it)
  var DEFAULT_CODE = "from turtle import *\n\nforward(100)\n";

  var codeEl = document.getElementById("code");
  var runBtn = document.getElementById("run");
  var outEl = document.getElementById("output");
  var statusEl = document.getElementById("status");
  var running = false;

  // --- editor -------------------------------------------------------------
  function getCode() { return codeEl.value; }
  function setCode(text) {
    codeEl.value = text == null ? "" : String(text);
    save();
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, codeEl.value); } catch (e) { /* storage may be unavailable */ }
  }
  function restore() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    codeEl.value = saved != null ? saved : DEFAULT_CODE;
  }
  codeEl.addEventListener("input", save);
  codeEl.addEventListener("keydown", function (ev) {
    if (ev.key === "Tab") {                      // a Tab inserts four spaces
      ev.preventDefault();
      var s = codeEl.selectionStart, e = codeEl.selectionEnd;
      codeEl.value = codeEl.value.slice(0, s) + "    " + codeEl.value.slice(e);
      codeEl.selectionStart = codeEl.selectionEnd = s + 4;
      save();
    } else if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      run();
    }
  });

  // --- Skulpt -------------------------------------------------------------
  function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) {
      throw "File not found: '" + x + "'";
    }
    return Sk.builtinFiles.files[x];
  }
  function print(text) {
    outEl.textContent += text;
    outEl.scrollTop = outEl.scrollHeight;
  }
  function clearDrawing() {
    var target = document.getElementById("turtle-canvas");
    while (target.firstChild) target.removeChild(target.firstChild);
  }
  function setStatus(text, isError) {
    statusEl.textContent = text;
    outEl.classList.toggle("error", !!isError);
  }

  function run() {
    if (running) return Promise.resolve();
    running = true;
    runBtn.disabled = true;
    outEl.textContent = "";
    clearDrawing();
    setStatus("en cours…");
    Sk.configure({
      output: print,
      read: builtinRead,
      __future__: Sk.python3,
      killableWhile: true,
      killableFor: true,
      execLimit: 20000                           // ms; a runaway loop stops the program
    });
    // The canvases take the panel's size at this moment; a resize applies on
    // the next run, which is also when the drawing is cleared anyway.
    var target = document.getElementById("turtle-canvas");
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "turtle-canvas";
    Sk.TurtleGraphics.width = target.clientWidth || 480;
    Sk.TurtleGraphics.height = target.clientHeight || 360;
    return Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody("<stdin>", false, getCode(), true);
    }).then(function () {
      setStatus("terminé");
      document.dispatchEvent(new CustomEvent("python-turtle:run", { detail: { ok: true } }));
    }, function (err) {
      print(String(err) + "\n");
      setStatus("erreur", true);
      document.dispatchEvent(new CustomEvent("python-turtle:run", { detail: { ok: false, error: String(err) } }));
    }).finally(function () {
      running = false;
      runBtn.disabled = false;
    });
  }

  runBtn.addEventListener("click", run);

  // --- the small API an adapter can use ------------------------------------
  window.PythonTurtle = {
    ready: typeof Sk !== "undefined",
    storageKey: STORAGE_KEY,
    getCode: getCode,
    setCode: setCode,
    run: run,
    focus: function () { codeEl.focus({ preventScroll: true }); }
  };

  restore();
  if (window.PythonTurtle.ready) {
    setStatus("prêt");
    document.dispatchEvent(new CustomEvent("python-turtle:ready"));
  } else {
    setStatus("Skulpt introuvable : lance scripts/vendor.sh", true);
  }
})();
