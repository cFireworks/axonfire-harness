# Native Galileo HTTP transport

`createNativeGalileoTransport` restores 21 complete statements from the captured
module 92763: encrypted HTTP transport, DEK cache and KMS exchange, AES encoding,
Galileo Base62 encoding, compression, routing and retry helpers. Source ranges
and the fixed SHA-256 are embedded in the module. Every recovered statement is
compared structurally with its captured AST.

The factory accepts explicit Node crypto, HTTP, HTTPS, zlib and SDK namespaces.
Importing it opens no connections. Transport requests occur only when callers
invoke `send`, `postJson`, or the KMS methods. Shutdown destroys its HTTP agent.

## Preserved behavior

Encryption is enabled by default but applies only to mapped collector origins;
skipped hosts and unmapped origins use ordinary payloads. Custom KMS mappings
extend the captured defaults. Encrypted payloads use optional gzip, Galileo's
Base62 encoding, and AES ECB with padding; the encrypted key token travels in
`Encrypted`, with `Galileo-compress: gzip` for compressed payloads. Ordinary
`Content-Encoding` headers are removed from encrypted requests.

KMS exchanges generate an RSA-2048 key pair, submit the public key, and decrypt
the returned data key with RSA PKCS#1 padding. The DEK cache shares the first
in-flight refresh, returns cached keys during later background refreshes, and
retains the original refresh/retry timing and error handling.

HTTP success covers 2xx. Only 429, 502, 503 and 504 are retryable. The transport
allows five retries within its original remaining-time calculation, using
Retry-After or jittered exponential backoff. `Retry-After: 0` becomes `-1`,
which Node clamps and warns about; this behavior is preserved. Timeouts destroy
the request, and transport exceptions become failure results.

## Verification and remaining scope

Six original/reconstructed paired scenarios verify:

- Real loopback HTTP payloads, gzip, success responses, 503 retry and 400 errors.
- AES-decrypted encrypted framing and header normalization.
- Initial key refresh sharing, stale-key return and cached error handling.
- Real KMS JSON HTTP handling, non-2xx responses and malformed JSON.
- Captured encryption routing, retry classification and backoff defaults.
- A real loopback KMS RSA exchange and two encrypted HTTP deliveries using one
  cached data key, with the receiving server decrypting and checking the body.

All servers bind ephemeral ports on `127.0.0.1`. No original telemetry endpoint
is contacted. The RSA exchange was verified with the current Node runtime;
compatibility across all Node/OpenSSL builds is not established. The cache
scheduling scenario substitutes the refresh method; the separate loopback test
exercises the real KMS fetch and cache path.

These tests establish transport behavior, not complete OTLP SDK integration.
Exporter wrappers, `SetupGalileo`, the SDK logger, instrumentation,
and default application assembly remain separate work.

```sh
npm run verify:galileo-transport -w @axonfire/harness -- /path/to/codebuddy.js
npm run smoke:galileo-transport -w @axonfire/harness
```

REA evidence: `ev_2d6d637d025c9e209754f6bd22c79a95494c11c92a94253bc7ac8fbe78a036e5`.
The inert extraction has 2,035 AST nodes in one parsed JavaScript file and no
parse failures. Semantic coverage is partial/truncated under 750-node and
150-unknown limits; the captured application bootstrap was never executed.

[OTLP JSON serializers](native-otlp-serializers.md) are now separately recovered
and tested with this transport against a real loopback HTTP receiver.
