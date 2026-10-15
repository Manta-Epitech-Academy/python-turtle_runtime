/* Tortue Python: a one-page runtime that runs Python with Skulpt and draws with
 * its turtle module. It knows nothing about the workshop platform: standalone it
 * is a tiny turtle playground, and the platform's adapter talks to the small
 * `window.PythonTurtle` API below. See README.md. */
(function () {
  "use strict";
  var STORAGE_KEY = "python-turtle-code";       // autosaved code (the platform snapshots it)
  var DEFAULT_CODE = "from turtle import *\n\nforward(100)\n";

  var hostEl = document.getElementById("code");
  var runBtn = document.getElementById("run");
  var outEl = document.getElementById("output");
  var statusEl = document.getElementById("status");
  var running = false;
  var editor = null;                             // Monaco, once loaded

  // --- editor -------------------------------------------------------------
  function getCode() { return editor ? editor.getValue() : ""; }
  function setCode(text) {
    if (editor) editor.setValue(text == null ? "" : String(text));
    save();
  }
  function save() {
    if (!editor) return;
    try { localStorage.setItem(STORAGE_KEY, editor.getValue()); } catch (e) { /* storage may be unavailable */ }
  }
  function savedCode() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    return saved != null ? saved : DEFAULT_CODE;
  }

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
  // Published once the editor and the interpreter are both usable: an adapter
  // that finds no `PythonTurtle` waits for the `python-turtle:ready` event.
  function publish() {
    window.PythonTurtle = {
      ready: true,
      storageKey: STORAGE_KEY,
      getCode: getCode,
      setCode: setCode,
      run: run,
      focus: function () { editor.focus(); }
    };
    setStatus("prêt");
    document.dispatchEvent(new CustomEvent("python-turtle:ready"));
  }

  if (typeof Sk === "undefined") {
    setStatus("Skulpt introuvable : lance scripts/vendor.sh", true);
    return;
  }
  window.initTurtleEditor(hostEl, savedCode()).then(function (ed) {
    editor = ed;
    editor.onDidChangeModelContent(save);
    // Ctrl+Entrée (Cmd+Entrée on a Mac) runs the program, as the button says.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
    publish();
  }, function (err) {
    setStatus(err.message, true);
  });
})();
