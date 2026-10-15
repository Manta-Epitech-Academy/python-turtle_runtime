> **Runtime `python-turtle`.**
> `docker pull ghcr.io/manta-epitech-academy/python-turtle_runtime:latest`: the image is built and
> published by `.github/workflows/` on every push to `main`, and serves the app at
> `/runtime/python-turtle/latest/`, the path the workshop platform embeds it at.
> Used by: [tortue_subject](https://github.com/kevin-cazal/tortue_subject).

# Tortue Python, a workshop runtime

A one-page Python turtle playground: a code editor, a run button, the drawing, the output.
Python runs in the browser with [Skulpt](https://skulpt.org), the editor is
[Monaco](https://microsoft.github.io/monaco-editor/); nothing is sent anywhere.

Monaco's automatic helpers are off, as in the other workshop runtimes: no closing brackets
or quotes, no suggestions, no hints, no reformatting, so nothing appears that the participant
did not type. Add `?helpers` to the address to turn them back on. Tab inserts four spaces,
Ctrl+Entrée runs the program.

It is a **runtime** for the
[ctfd-workshop-platform](https://github.com/Manta-Epitech-Academy/ctfd-workshop-platform):
a static site the platform serves beside a subject's instructions. The platform's adapter
(`plugins/workshop/assets/runtime/adapters/python-turtle.js` there) talks to the small
`window.PythonTurtle` API in `app.js`. Nothing in this repository knows the platform exists,
which is the rule for every runtime.

## Run it standalone

```sh
scripts/vendor.sh            # fetches Skulpt and Monaco into vendor/ (once)
python3 -m http.server 8000  # then open http://localhost:8000/
```

## Layout

```
index.html        the page
style.css
editor.js         Monaco, with its helpers off (?helpers turns them on)
app.js            autosave, Skulpt, the PythonTurtle API
scripts/vendor.sh fetches Skulpt and Monaco; vendor/ is gitignored
Dockerfile        the same site behind nginx, for the cluster (docker/nginx.conf)
.github/          publishes the image to GHCR and the site to GitHub Pages
```

## The API an adapter uses

| Member | Meaning |
|---|---|
| `PythonTurtle.ready` | `true` once the editor and the interpreter are loaded; `window.PythonTurtle` exists from then on, and the `python-turtle:ready` event fires |
| `PythonTurtle.storageKey` | the `localStorage` key the code is autosaved under |
| `PythonTurtle.getCode()`, `setCode(text)` | read or replace the editor |
| `PythonTurtle.run()` | run the code; resolves when done; `python-turtle:run` fires with `{ok, error?}` |
| `PythonTurtle.focus()` | put the keyboard in the editor |
