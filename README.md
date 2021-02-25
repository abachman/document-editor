# collaborative editing ideas

## goal

To allow simultaneous (collaborative) and offline editing of a JSON object.

### idea: give operational transforma chance <------- where i am today

Starting with the logical guts of: https://github.com/aha-app/collaborative-demo

And converting to typescript + redux + not a collaborative text editor.

### idea: automerge

[https://github.com/automerge/automerge](https://github.com/automerge/automerge)

roughly: use `const doc = Automerge.load(document.data)` and `document.data = doc.save()` to hydrate and serialize content to the DB.

problem: this reduces to roughly the same problem, because multiple websocket clients will load() from a jsonb column at different times, which means they may get different versions of the same record without knowing that another version exists.

can we:

- load from DB
- compare to local
- do merge if necessary
- store to DB
  ??

we'd need a lock/mutex on the row, but yes. Automerge would be overkill here, though.

If postgres is central / trusted / canonical, automerge, which was built for a local-first world, may not be a good fit.

## Running the App

```console
$ bundle install
$ yarn install
$ bin/rails db:create db:schema:load
$ gem install foreman
$ foreman start
$ open http://localhost:5000
```
