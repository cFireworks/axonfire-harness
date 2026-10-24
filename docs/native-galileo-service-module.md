# GalileoService SDK binding

`createNativeGalileoServiceModule(runtime, sdk)` connects the original GalileoService class to an existing `createNativeGalileoSdkHost` instance. It binds real SDK setup, outer Logger, trace and metrics APIs, enum/value types, Node OS/HTTPS builtins, the recovered proxy agent and the original product configuration resolver.

This is an authored composition boundary. Original service methods, decorators and SDK component bodies remain unchanged.

## Caller responsibilities

The caller supplies the original application's DI parents: service token, decorators/lifecycle, authentication token, product/client-info tokens and diagnostic logger/tracer-provider tokens. Module 9151 must be supplied for the product tokens; its resolver is replaced with the recovered resolver. The returned module exposes the original decorated service class for construction or DI registration.

Use the same process surface for the service and SDK host. Product configuration, authentication subscriptions and optional primary trace processor attachment remain application dependencies. The binding does not construct substitutes for them.

The caller owns lifecycle sequencing: initialize and await readiness; stop new application work; call service `onStop()` and await `shutdown()`; then close the SDK host to release polling, instrumentation and remaining providers. Do not close the SDK host while service configuration changes are still running.

The original service's process-wide HTTPS proxy request patch is preserved and is not automatically restored by this binding. The binding makes no claim to support multiple independently configured services sharing that patch.

## Integration evidence

The compiled integration test starts a real loopback collector, uses the recovered resolver and remote Config client, and initializes the original service through the public SDK host. It checks actual provider identity and received startup span, log, histogram and counter payloads, followed by service unsubscribe/disposal and SDK shutdown. The service is resolved through the recovered DI container, with original decorators and property injection. Only application product/auth and diagnostic inputs are fixtures; DI, SDK providers and transport are real.

Loopback origins are not in the original encryption endpoint map, so this test preserves the original plaintext fallback for those origins. The transport's separate tests cover the RSA/KMS encrypted path.

This binding does not complete the default application DI graph or bootstrap. See [recovery status](recovery-status.md) for the remaining reconstruction boundaries.

See [Native DI](native-di.md) for the recovered container and core binding module. Pass its `Reflect` surface with the framework namespace when creating service modules.
