# Native HTTPS proxy agent

`createNativeHttpsProxyAgent` restores factory 64007 and its complete 20-factory dependency closure, including agent-base, CONNECT response parsing, debug helpers and Node builtin adapters. It supplies the proxy dependency used by GalileoService.

The recovered implementation supports HTTP and HTTPS proxies, CONNECT authentication, custom proxy headers, TLS destination sockets and the original response/error handling. It retains the original code rather than substituting an installed proxy library.

## Verification

`verify:https-proxy-agent` checks all 20 factory ASTs against the fixed sample and compares recovered and captured implementations in three scenarios:

- A real loopback HTTP tunnel with encoded credentials and custom headers.
- TLS to both an HTTPS proxy and the destination through the tunnel. A public test-only self-signed certificate is used; verification is disabled only in this fixture.
- Fragmented CONNECT responses, repeated headers, malformed headers and premature closure.

REA evidence `ev_65398ccdbe91b2a438c7a484fdfc9cda66998c05386447f9f78a0dfb90fe455d` covers 20 parsed files and 5,459 AST nodes, with zero parse failures. Semantic coverage is partial and truncated at the configured limits; static analysis is not treated as proof of complete behavior.

```sh
npm run verify:https-proxy-agent -w @axonfire/harness -- /absolute/path/to/codebuddy.js
```

## Runtime boundary

Pass explicit `require` and `globals` surfaces, and optionally `process` and `console`. The caller owns agents and must destroy them when finished. This factory does not patch HTTP globally. The original GalileoService has a separate HTTPS request patch whose lifecycle is unchanged.
