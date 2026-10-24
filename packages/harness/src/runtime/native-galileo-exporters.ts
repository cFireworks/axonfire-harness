// @ts-nocheck
// Original trace/log constructors bound to explicitly supplied recovered components.
export const GALILEO_EXPORTERS_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_EXPORTERS_REGIONS = [
  [7978337, 7978487],
  [7978625, 7978873],
  [7979128, 7979368],
  [7982274, 7982395],
] as const;
export const GALILEO_EXPORTERS_MODULES = [
  [15086, 1530535, 1532475],
  [15183, 1677088, 1680898],
] as const;
export function createNativeGalileoExporters(runtime: {
  constantsOnly: true;
}): { sdk: any; getModule: (id: number) => any };
export function createNativeGalileoExporters(runtime: any): {
  GalileoEncryptedTraceExporter: any;
  GalileoEncryptedLogExporter: any;
  sdk: any;
  getModule: (id: number) => any;
};
export function createNativeGalileoExporters(runtime: any) {
  const factories = {
      15086(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            CALLER_AND_CALLEE_INFO_FIELDS_DEFAULT: () => eS,
            LOG_COLLECTOR_ADDR: () => eg,
            LOG_COLLECTOR_SG_ADDR: () => eC,
            METRICS_COLLECTOR_ADDR: () => ed,
            METRICS_COLLECTOR_SG_ADDR: () => em,
            METRICS_CONFIG: () => eQ,
            OCP_ADDR: () => ef,
            OCP_SG_ADDR: () => ew,
            PROFILE_COLLECTOR_ADDR: () => eh,
            PROFILE_COLLECTOR_SG_ADDR: () => ey,
            RESERVED_USER_EXT_FIELDS: () => eI,
            SDK_VERSION: () => eB,
            SELF_MONITOR: () => e_,
            TRACE_COLLECTOR_ADDR: () => ep,
            TRACE_COLLECTOR_SG_ADDR: () => eE,
            TRACE_CONFIG: () => ev,
          }));
        var eu = ec(15183);
        let ed = "http://otlp.j.woa.com:80/v1/metrics",
          ep = "http://otlp.j.woa.com:80/v1/traces",
          eg = "http://otlp.j.woa.com/v1/logs",
          eh = "http://gotp.woa.com/api/v1/profile/write",
          ef = "http://gocp.woa.com/ocp/api/v1/get_config",
          em = "https://sg.tgalileo.com/v1/metrics",
          eE = "https://sg.tgalileo.com/v1/traces",
          eC = "https://sg.tgalileo.com/v1/logs",
          ey = "https://sg.tgalileo.com/api/v1/profile/write",
          ew = "https://sg.tgalileo.com/ocp/api/v1/get_config",
          eB = "0.3.17-beta.1",
          e_ = "NodeStats",
          eI = [
            eu.ClientServerMetricAttributes.UserExt1,
            eu.ClientServerMetricAttributes.UserExt2,
            eu.ClientServerMetricAttributes.UserExt3,
          ],
          ev = {
            enable: !0,
            processor: {
              sampler: {
                fraction: 1e-4,
                enableParentSample: !0,
                enableRandomSample: !1,
              },
              enableTraceBody: !1,
            },
          },
          eS = {
            [eu.ClientServerMetricAttributes.CallerService]: "",
            [eu.ClientServerMetricAttributes.CallerMethod]: "",
            [eu.ClientServerMetricAttributes.CallerConSetid]: "",
            [eu.ClientServerMetricAttributes.CallerServer]: "",
            [eu.ClientServerMetricAttributes.CallerGroup]: "",
            [eu.ClientServerMetricAttributes.CallerIp]: "",
            [eu.ClientServerMetricAttributes.CallerContainer]: "",
            [eu.ClientServerMetricAttributes.CalleeService]: "",
            [eu.ClientServerMetricAttributes.CalleeMethod]: "",
            [eu.ClientServerMetricAttributes.CalleeConSetid]: "",
            [eu.ClientServerMetricAttributes.CalleeServer]: "",
            [eu.ClientServerMetricAttributes.CalleeIp]: "",
            [eu.ClientServerMetricAttributes.CalleeContainer]: "",
          },
          eQ = {
            clientBuckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 3],
            serverBuckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 3],
          };
      },
      15183(eA, el, ec) {
        "use strict";
        var eu, ed, ep, eg, eh, ef, em, eE;
        (ec.r(el),
          ec.d(el, {
            GalileoTraceResourceAttributes: () => eC,
            ClientServerMetricAttributes: () => ep,
            EnvNameValues: () => em,
            GalileoResourceAttributes: () => eh,
            ProcessMetrics: () => ed,
            LanguageValues: () => eE,
            NamespaceValues: () => ef,
            GalileoTraceAttributes: () => ey,
            SDKNameValue: () => ew,
            GalileoMeters: () => eg,
            ClientServerMetrics: () => eu,
          }));
        let eC = {
            TARGET: "target",
            NAMESPACE: "namespace",
            ENV_NAME: "envname",
            HOST_IP: "net.host.ip",
            HOST_NAME: "net.host.name",
            HOST_PORT: "net.host.port",
            CONTAINER_NAME: "container.name",
            SET_NAME: "set.name",
            SERVICE_NAME: "service.name",
            SERVER_OWNER: "server.owner",
            TENANT_ID: "tps.tenant.id",
            CMDB_ID: "cmdb.module.id",
            LANGUAGE: "telemetry.sdk.language",
            SDK_NAME: "telemetry.sdk.name",
            SDK_VERSION: "telemetry.sdk.version",
          },
          ey = {
            TRPC_CALLEE_SERVICE: "trpc.callee_service",
            TRPC_CALLEE_METHOD: "trpc.callee_method",
            TRPC_CALLER_SERVICE: "trpc.caller_service",
            TRPC_CALLER_METHOD: "trpc.caller_method",
            TRPC_NAMESPACE: "trpc.namespace",
            TRPC_ENV_NAME: "trpc.envname",
            TRPC_STATUS_CODE: "trpc.status_code",
            TRPC_STATUS_MSG: "trpc.status_msg",
            TRPC_STATUS_TYPE: "trpc.status_type",
            CALLEE_SERVICE: "callee_service",
            CALLEE_METHOD: "callee_method",
            CALLER_SERVICE: "caller_service",
            CALLER_METHOD: "caller_method",
            CALLEE_SYSTEM_NAME: "callee.system.name",
            CALLEE_SYSTEM_CATEGORY: "callee.system.category",
            CALLEE_SYSTEM_PROTOCOL: "callee.system.protocol",
            CALLER_SYSTEM_NAME: "caller.system.name",
            CALLER_SYSTEM_CATEGORY: "caller.system.category",
            CALLER_SYSTEM_PROTOCOL: "caller.system.protocol",
          };
        (!(function (eA) {
          ((eA.ClientStartedTotal = "rpc_client_started_total"),
            (eA.ClientHandledTotal = "rpc_client_handled_total"),
            (eA.ClientHandledSeconds = "rpc_client_handled_seconds"),
            (eA.ServerStartedTotal = "rpc_server_started_total"),
            (eA.ServerHandledTotal = "rpc_server_handled_total"),
            (eA.ServerHandledSeconds = "rpc_server_handled_seconds"));
        })(eu || (eu = {})),
          (function (eA) {
            ((eA.ProcessCpuUsage = "process_cpu_usage"),
              (eA.ProcessResidentMemoryUsage = "process_resident_memory_usage"),
              (eA.ProcessNetworkInBytes = "process_network_in_bytes"),
              (eA.ProcessNetworkOutBytes = "process_network_out_bytes"),
              (eA.ProcessBlockReadBytes = "process_block_read_bytes"),
              (eA.ProcessBlockWriteBytes = "process_block_write_bytes"),
              (eA.ProcessContainerNum = "process_container_num"),
              (eA.ProcessGpuUsage = "process_gpu_usage"),
              (eA.ProcessVideoMemoryUsage = "process_video_memory_usage"),
              (eA.ProcessDiskUsage = "process_disk_usage"),
              (eA.ProcessTcpNum = "process_tcp_num"),
              (eA.ProcessUdpNum = "process_udp_num"),
              (eA.ProcessMaxFds = "process_max_fds"),
              (eA.ProcessOpenFds = "process_open_fds"),
              (eA.ProcessPidNum = "process_pid_num"),
              (eA.ProcessDiskFree = "process_disk_free"),
              (eA.ProcessDiskUsed = "process_disk_used"),
              (eA.ProcessDiskUsedFraction = "process_disk_used_fraction"),
              (eA.ProcessCpuCores = "process_cpu_cores"));
          })(ed || (ed = {})),
          (function (eA) {
            ((eA.CallerService = "caller_service"),
              (eA.CallerMethod = "caller_method"),
              (eA.CallerConSetid = "caller_con_setid"),
              (eA.CallerServer = "caller_server"),
              (eA.CalleeServer = "callee_server"),
              (eA.CalleeService = "callee_service"),
              (eA.CalleeMethod = "callee_method"),
              (eA.CalleeConSetid = "callee_con_setid"),
              (eA.CallerGroup = "caller_group"),
              (eA.CodeType = "code_type"),
              (eA.Code = "code"),
              (eA.UserExt1 = "user_ext1"),
              (eA.UserExt2 = "user_ext2"),
              (eA.UserExt3 = "user_ext3"),
              (eA.CalleeIp = "callee_ip"),
              (eA.CalleeContainer = "callee_container"),
              (eA.CallerIp = "caller_ip"),
              (eA.CallerContainer = "caller_container"));
          })(ep || (ep = {})),
          (function (eA) {
            ((eA.clientMetrics = "client_metrics"),
              (eA.serverMetrics = "server_metrics"));
          })(eg || (eg = {})),
          (function (eA) {
            ((eA.Target = "target"),
              (eA.EnvName = "env_name"),
              (eA.Namespace = "namespace"),
              (eA.ServiceName = "service_name"),
              (eA.ContainerName = "container_name"),
              (eA.Instance = "instance"),
              (eA.Version = "version"),
              (eA.ConSetid = "con_setid"));
          })(eh || (eh = {})),
          (function (eA) {
            ((eA.Development = "Development"), (eA.Production = "Production"));
          })(ef || (ef = {})),
          (function (eA) {
            ((eA.Formal = "formal"), (eA.Test = "test"));
          })(em || (em = {})),
          (function (eA) {
            ((eA.Webjs = "webjs"), (eA.Nodejs = "nodejs"));
          })(eE || (eE = {})));
        let ew = "galileo";
      },
    },
    cache = new Map();
  function ec(id: number): any {
    if (cache.has(id)) return cache.get(id);
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m.exports);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit OTLP export parent required: " + id);
    return value;
  }
  ec.r = (o: any) => Object.defineProperty(o, "__esModule", { value: true });
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };

  if (runtime.constantsOnly) return { sdk: ec(15086), getModule: ec };
  const eG = ec(15086),
    eY = runtime.exports.OTLPExporterBase,
    createOtlpNetworkExportDelegate =
      runtime.exports.createOtlpNetworkExportDelegate,
    e8 = runtime.serializers.trace,
    e6 = runtime.serializers.logs,
    GalileoEncryptedOtlpHttpTransport =
      runtime.transport.GalileoEncryptedOtlpHttpTransport,
    convertLegacyHttpOptions = runtime.http.convertLegacyHttpOptions;
  let Ac = { "User-Agent": `Galileo-Node-SDK/${eG.SDK_VERSION}` },
    Au = ["otlp.j.woa.com", "gocp.woa.com", "gotp.woa.com"],
    Ad = 5e3,
    Ap = 5,
    Ag = 1e3,
    Ah = 5e3,
    Af = 1.5,
    Am = 0.2;
  let GalileoEncryptedTraceExporter = class GalileoEncryptedTraceExporter extends eY {
    constructor(eA = {}, el) {
      const ec = createHttpOptions(eA, "TRACES", "v1/traces");
      super(
        createOtlpNetworkExportDelegate(
          ec,
          e8,
          new GalileoEncryptedOtlpHttpTransport(ec, el),
        ),
      );
    }
  };
  let GalileoEncryptedLogExporter = class GalileoEncryptedLogExporter extends eY {
    constructor(eA = {}, el) {
      const ec = createHttpOptions(eA, "LOGS", "v1/logs");
      super(
        createOtlpNetworkExportDelegate(
          ec,
          e6,
          new GalileoEncryptedOtlpHttpTransport(ec, el),
        ),
      );
    }
  };
  function createHttpOptions(eA, el, ec) {
    return convertLegacyHttpOptions(eA, el, ec, {
      ...Ac,
      "Content-Type": "application/json",
    });
  }
  return {
    GalileoEncryptedTraceExporter,
    GalileoEncryptedLogExporter,
    sdk: eG,
    getModule: ec,
  };
}
