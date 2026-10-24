# Captured Express runtime

`createNativeExpress({require, ...runtime})` restores the Express implementation embedded in the fixed WorkBuddy bundle and its 169-factory dependency closure. It returns `express` and `getModule(id)` without starting a listener. No npm Express version is substituted.

The closure includes routing, request/response helpers, body parsers, static-file delivery, MIME data and encoding utilities. Node builtins are supplied through the explicit require boundary. Optional process, console, Buffer and global surfaces can be supplied for isolated execution.

## Verification

The source verifier checks every complete factory AST against the fixed bundle. Two source/port scenarios exercise real loopback HTTP:

- Gzip JSON parsing, route/query parameters, malformed and oversized bodies, synchronous route errors, error middleware and the wildcard route used by the original server entrypoint.
- Static-file byte ranges and HEAD responses, plus mounted router parameter merging.

The test process environment is explicit and servers and temporary files are closed after each run. These scenarios establish the listed behaviors; they do not claim exhaustive coverage of Express extensions or application-specific routes.

```sh
npm run verify:express -w @axonfire/harness -- /absolute/path/to/codebuddy.js
npm run smoke:native-di -w @axonfire/harness
```

See [Native backend server](native-backend-server.md) for its use by the recovered WorkBuddy server entrypoint.
