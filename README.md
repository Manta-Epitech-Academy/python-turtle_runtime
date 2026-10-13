> **Runtime `python-turtle`.**
> `docker pull ghcr.io/kevin-cazal/python-turtle_runtime:latest`: the image is built and
> published by `.github/workflows/` on every push to `main`, and serves the app at
> `/runtime/python-turtle/latest/`, the path the workshop platform embeds it at.
> Used by: [tortue_subject](https://github.com/kevin-cazal/tortue_subject).

# Tortue Python, a workshop runtime

A one-page Python turtle playground: a code editor, a run button, the drawing, the output.
Python runs in the browser with [Skulpt](https://skulpt.org); nothing is sent anywhere.

It is a **runtime** for the
[ctfd-workshop-platform](https://github.com/Manta-Epitech-Academy/ctfd-workshop-platform):
a static site the platform serves beside a subject's instructions. The platform's adapter
(`plugins/workshop/assets/runtime/adapters/python-turtle.js` there) talks to the small
`window.PythonTurtle` API in `app.js`. Nothing in this repository knows the platform exists,
which is the rule for every runtime.

## Run it standalone

```sh
scripts/vendor.sh            # fetches Skulpt into vendor/ (once)
python3 -m http.server 8000  # then open http://localhost:8000/
```

## Layout

```
index.html        the page
style.css
app.js            editor, autosave, Skulpt, the PythonTurtle API
scripts/vendor.sh fetches the interpreter; vendor/ is gitignored
Dockerfile        the same site behind nginx, for the cluster (docker/nginx.conf)
.github/          publishes the image to GHCR and the site to GitHub Pages
```

## The API an adapter uses

| Member | Meaning |
|---|---|
| `PythonTurtle.ready` | `true` once the interpreter is loaded; the `python-turtle:ready` event fires then |
| `PythonTurtle.storageKey` | the `localStorage` key the code is autosaved under |
| `PythonTurtle.getCode()`, `setCode(text)` | read or replace the editor |
| `PythonTurtle.run()` | run the code; resolves when done; `python-turtle:run` fires with `{ok, error?}` |
| `PythonTurtle.focus()` | put the keyboard in the editor |
