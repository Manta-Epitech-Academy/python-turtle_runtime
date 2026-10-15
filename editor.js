/* The code editor: Monaco, loaded from vendor/monaco with its AMD loader.
 *
 * This is a teaching tool, so Monaco's automatic helpers are off: nothing
 * appears in the editor that the participant did not type. Closing brackets
 * and quotes, suggestions, parameter hints, hovers, snippets and reformatting
 * all short-circuit the part of coding a beginner is there to practise, and
 * the error that follows an inserted character relates to nothing they did.
 * What only displays (colouring, line numbers, folding) stays.
 *
 * `?helpers` (or `?helpers=1`) in the address turns the helpers back on, as in
 * the tic80 runtime.
 */
(function () {
  "use strict";
  var VS = "vendor/monaco/vs";

  // Python needs no language service, so the generic worker is the only one.
  // In the minified build it is base/worker/workerMain.js: there is no
  // editor.worker.js there, and a missing worker makes Monaco fall back to the
  // main thread with a warning.
  window.MonacoEnvironment = {
    getWorkerUrl: function () { return VS + "/base/worker/workerMain.js"; }
  };

  function helpersEnabled() {
    var value = new URLSearchParams(window.location.search).get("helpers");
    return value !== null && ["", "1", "true", "on", "yes"].indexOf(value.toLowerCase()) >= 0;
  }

  var BASE_OPTIONS = {
    language: "python",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: "on",
    wordWrap: "on",
    scrollBeyondLastLine: false,
    folding: true,
    // Python counts the spaces: four per level, and Tab inserts them.
    tabSize: 4,
    insertSpaces: true,
    detectIndentation: false,
    renderWhitespace: "boundary"
  };

  var NO_HELPERS_OPTIONS = {
    // Pairs: "print('bonjour" became "print('bonjour')", then one pair too many
    // as soon as the participant typed their own.
    autoClosingBrackets: "never",
    autoClosingQuotes: "never",
    autoClosingComments: "never",
    autoClosingDelete: "never",
    autoClosingOvertype: "never",
    autoSurround: "never",
    // Suggestions: the list opens while typing, and Enter accepts a word
    // instead of going to the next line.
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnEnter: "off",
    acceptSuggestionOnCommitCharacter: false,
    wordBasedSuggestions: "off",
    snippetSuggestions: "none",
    tabCompletion: "off",
    inlineSuggest: { enabled: false },
    parameterHints: { enabled: false },
    hover: { enabled: false },
    // Actions and reformatting rewrite code already typed.
    codeLens: false,
    lightbulb: { enabled: false },
    formatOnType: false,
    formatOnPaste: false,
    // A new line keeps the indentation of the previous one and never realigns
    // a line already written. The participant adds the four spaces after a
    // colon themselves: that is the thing the function steps teach.
    autoIndent: "keep",
    // Dragging code with the mouse happens unnoticed and looks like loss.
    dragAndDrop: false
  };

  function options() {
    var o = {}, k;
    for (k in BASE_OPTIONS) o[k] = BASE_OPTIONS[k];
    if (!helpersEnabled()) for (k in NO_HELPERS_OPTIONS) o[k] = NO_HELPERS_OPTIONS[k];
    return o;
  }

  /* Resolves with a Monaco editor in `host`, or rejects if Monaco is missing. */
  window.initTurtleEditor = function (host, value) {
    return new Promise(function (resolve, reject) {
      if (typeof require === "undefined" || !require.config) {
        reject(new Error("Monaco introuvable : lance scripts/vendor.sh"));
        return;
      }
      require.config({ paths: { vs: VS } });
      require(["vs/editor/editor.main"], function () {
        var o = options();
        o.value = value;
        resolve(monaco.editor.create(host, o));
      }, function (err) {
        reject(new Error("Monaco n'a pas pu se charger : " + err));
      });
    });
  };
})();
