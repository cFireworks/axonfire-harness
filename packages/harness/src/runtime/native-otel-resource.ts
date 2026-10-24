// @ts-nocheck
// Complete captured Resource, semantic constants and SDK/service defaults.
export const OTEL_RESOURCE_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const OTEL_RESOURCE_MODULES = [
  [78766, 1283655, 1287941],
  [42152, 1347156, 1356070],
  [80221, 1008699, 1009033],
  [39858, 1310955, 1311115],
  [92321, 1346917, 1347155],
] as const;
export function createNativeOtelResource(runtime: any) {
  if (!runtime?.process || !runtime.diag)
    throw Error("Explicit resource process and diagnostics required");
  const process = runtime.process;
  const factories = {
      78766(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { Resource: () => eh }));
        var eu = ec(2339),
          ed = ec(42152),
          ep = ec(80221),
          eg = ec(39858),
          __assign = function () {
            return (__assign =
              Object.assign ||
              function (eA) {
                for (var el, ec = 1, eu = arguments.length; ec < eu; ec++)
                  for (var ed in (el = arguments[ec]))
                    Object.prototype.hasOwnProperty.call(el, ed) &&
                      (eA[ed] = el[ed]);
                return eA;
              }).apply(this, arguments);
          },
          __awaiter = function (eA, el, ec, eu) {
            function adopt(eA) {
              return eA instanceof ec
                ? eA
                : new ec(function (el) {
                    el(eA);
                  });
            }
            return new (ec || (ec = Promise))(function (ec, ed) {
              function fulfilled(eA) {
                try {
                  step(eu.next(eA));
                } catch (eA) {
                  ed(eA);
                }
              }
              function rejected(eA) {
                try {
                  step(eu.throw(eA));
                } catch (eA) {
                  ed(eA);
                }
              }
              function step(eA) {
                eA.done
                  ? ec(eA.value)
                  : adopt(eA.value).then(fulfilled, rejected);
              }
              step((eu = eu.apply(eA, el || [])).next());
            });
          },
          __generator = function (eA, el) {
            var ec,
              eu,
              ed,
              ep,
              eg = {
                label: 0,
                sent: function () {
                  if (1 & ed[0]) throw ed[1];
                  return ed[1];
                },
                trys: [],
                ops: [],
              };
            return (
              (ep = { next: verb(0), throw: verb(1), return: verb(2) }),
              "function" == typeof Symbol &&
                (ep[Symbol.iterator] = function () {
                  return this;
                }),
              ep
            );
            function verb(eA) {
              return function (el) {
                return step([eA, el]);
              };
            }
            function step(ep) {
              if (ec) throw TypeError("Generator is already executing.");
              for (; eg; )
                try {
                  if (
                    ((ec = 1),
                    eu &&
                      (ed =
                        2 & ep[0]
                          ? eu.return
                          : ep[0]
                            ? eu.throw || ((ed = eu.return) && ed.call(eu), 0)
                            : eu.next) &&
                      !(ed = ed.call(eu, ep[1])).done)
                  )
                    return ed;
                  switch (
                    ((eu = 0), ed && (ep = [2 & ep[0], ed.value]), ep[0])
                  ) {
                    case 0:
                    case 1:
                      ed = ep;
                      break;
                    case 4:
                      return (eg.label++, { value: ep[1], done: !1 });
                    case 5:
                      (eg.label++, (eu = ep[1]), (ep = [0]));
                      continue;
                    case 7:
                      ((ep = eg.ops.pop()), eg.trys.pop());
                      continue;
                    default:
                      if (
                        !(ed =
                          (ed = eg.trys).length > 0 && ed[ed.length - 1]) &&
                        (6 === ep[0] || 2 === ep[0])
                      ) {
                        eg = 0;
                        continue;
                      }
                      if (
                        3 === ep[0] &&
                        (!ed || (ep[1] > ed[0] && ep[1] < ed[3]))
                      ) {
                        eg.label = ep[1];
                        break;
                      }
                      if (6 === ep[0] && eg.label < ed[1]) {
                        ((eg.label = ed[1]), (ed = ep));
                        break;
                      }
                      if (ed && eg.label < ed[2]) {
                        ((eg.label = ed[2]), eg.ops.push(ep));
                        break;
                      }
                      (ed[2] && eg.ops.pop(), eg.trys.pop());
                      continue;
                  }
                  ep = el.call(eA, eg);
                } catch (eA) {
                  ((ep = [6, eA]), (eu = 0));
                } finally {
                  ec = ed = 0;
                }
              if (5 & ep[0]) throw ep[1];
              return { value: ep[0] ? ep[1] : void 0, done: !0 };
            }
          },
          __read = function (eA, el) {
            var ec = "function" == typeof Symbol && eA[Symbol.iterator];
            if (!ec) return eA;
            var eu,
              ed,
              ep = ec.call(eA),
              eg = [];
            try {
              for (; (void 0 === el || el-- > 0) && !(eu = ep.next()).done; )
                eg.push(eu.value);
            } catch (eA) {
              ed = { error: eA };
            } finally {
              try {
                eu && !eu.done && (ec = ep.return) && ec.call(ep);
              } finally {
                if (ed) throw ed.error;
              }
            }
            return eg;
          },
          eh = (function () {
            function Resource(eA, el) {
              var ec,
                ed = this;
              ((this._attributes = eA),
                (this.asyncAttributesPending = null != el),
                (this._syncAttributes =
                  null != (ec = this._attributes) ? ec : {}),
                (this._asyncAttributesPromise =
                  null == el
                    ? void 0
                    : el.then(
                        function (eA) {
                          return (
                            (ed._attributes = Object.assign(
                              {},
                              ed._attributes,
                              eA,
                            )),
                            (ed.asyncAttributesPending = !1),
                            eA
                          );
                        },
                        function (eA) {
                          return (
                            eu.diag.debug(
                              "a resource's async attributes promise rejected: %s",
                              eA,
                            ),
                            (ed.asyncAttributesPending = !1),
                            {}
                          );
                        },
                      )));
            }
            return (
              (Resource.empty = function () {
                return Resource.EMPTY;
              }),
              (Resource.default = function () {
                var eA;
                return new Resource(
                  (((eA = {})[ed.SEMRESATTRS_SERVICE_NAME] = (0,
                  eg.defaultServiceName)()),
                  (eA[ed.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] =
                    ep.SDK_INFO[ed.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE]),
                  (eA[ed.SEMRESATTRS_TELEMETRY_SDK_NAME] =
                    ep.SDK_INFO[ed.SEMRESATTRS_TELEMETRY_SDK_NAME]),
                  (eA[ed.SEMRESATTRS_TELEMETRY_SDK_VERSION] =
                    ep.SDK_INFO[ed.SEMRESATTRS_TELEMETRY_SDK_VERSION]),
                  eA),
                );
              }),
              Object.defineProperty(Resource.prototype, "attributes", {
                get: function () {
                  var eA;
                  return (
                    this.asyncAttributesPending &&
                      eu.diag.error(
                        "Accessing resource attributes before async attributes settled",
                      ),
                    null != (eA = this._attributes) ? eA : {}
                  );
                },
                enumerable: !1,
                configurable: !0,
              }),
              (Resource.prototype.waitForAsyncAttributes = function () {
                return __awaiter(this, void 0, void 0, function () {
                  return __generator(this, function (eA) {
                    switch (eA.label) {
                      case 0:
                        if (!this.asyncAttributesPending) return [3, 2];
                        return [4, this._asyncAttributesPromise];
                      case 1:
                        (eA.sent(), (eA.label = 2));
                      case 2:
                        return [2];
                    }
                  });
                });
              }),
              (Resource.prototype.merge = function (eA) {
                var el,
                  ec = this;
                if (!eA) return this;
                var eu = __assign(
                  __assign({}, this._syncAttributes),
                  null != (el = eA._syncAttributes) ? el : eA.attributes,
                );
                return this._asyncAttributesPromise ||
                  eA._asyncAttributesPromise
                  ? new Resource(
                      eu,
                      Promise.all([
                        this._asyncAttributesPromise,
                        eA._asyncAttributesPromise,
                      ]).then(function (el) {
                        var eu,
                          ed = __read(el, 2),
                          ep = ed[0],
                          eg = ed[1];
                        return __assign(
                          __assign(
                            __assign(__assign({}, ec._syncAttributes), ep),
                            null != (eu = eA._syncAttributes)
                              ? eu
                              : eA.attributes,
                          ),
                          eg,
                        );
                      }),
                    )
                  : new Resource(eu);
              }),
              (Resource.EMPTY = new Resource({})),
              Resource
            );
          })();
      },
      42152(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            AWSECSLAUNCHTYPEVALUES_EC2: () => r8,
            AWSECSLAUNCHTYPEVALUES_FARGATE: () => r5,
            AwsEcsLaunchtypeValues: () => r6,
            CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS: () => rF,
            CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC: () => rU,
            CLOUDPLATFORMVALUES_AWS_EC2: () => rj,
            CLOUDPLATFORMVALUES_AWS_ECS: () => rG,
            CLOUDPLATFORMVALUES_AWS_EKS: () => rH,
            CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK: () => r$,
            CLOUDPLATFORMVALUES_AWS_LAMBDA: () => rK,
            CLOUDPLATFORMVALUES_AZURE_AKS: () => rq,
            CLOUDPLATFORMVALUES_AZURE_APP_SERVICE: () => rW,
            CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES: () => rJ,
            CLOUDPLATFORMVALUES_AZURE_FUNCTIONS: () => rz,
            CLOUDPLATFORMVALUES_AZURE_VM: () => rY,
            CLOUDPLATFORMVALUES_GCP_APP_ENGINE: () => r1,
            CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS: () => r0,
            CLOUDPLATFORMVALUES_GCP_CLOUD_RUN: () => rZ,
            CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE: () => rV,
            CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE: () => rX,
            CLOUDPROVIDERVALUES_ALIBABA_CLOUD: () => rf,
            CLOUDPROVIDERVALUES_AWS: () => rm,
            CLOUDPROVIDERVALUES_AZURE: () => rE,
            CLOUDPROVIDERVALUES_GCP: () => rC,
            CloudPlatformValues: () => r2,
            CloudProviderValues: () => ry,
            HOSTARCHVALUES_AMD64: () => ng,
            HOSTARCHVALUES_ARM32: () => nh,
            HOSTARCHVALUES_ARM64: () => nf,
            HOSTARCHVALUES_IA64: () => nm,
            HOSTARCHVALUES_PPC32: () => nE,
            HOSTARCHVALUES_PPC64: () => nC,
            HOSTARCHVALUES_X86: () => ny,
            HostArchValues: () => nw,
            OSTYPEVALUES_AIX: () => nG,
            OSTYPEVALUES_DARWIN: () => nN,
            OSTYPEVALUES_DRAGONFLYBSD: () => nU,
            OSTYPEVALUES_FREEBSD: () => nP,
            OSTYPEVALUES_HPUX: () => nj,
            OSTYPEVALUES_LINUX: () => nO,
            OSTYPEVALUES_NETBSD: () => nL,
            OSTYPEVALUES_OPENBSD: () => nF,
            OSTYPEVALUES_SOLARIS: () => nH,
            OSTYPEVALUES_WINDOWS: () => nx,
            OSTYPEVALUES_Z_OS: () => nK,
            OsTypeValues: () => n$,
            SEMRESATTRS_AWS_ECS_CLUSTER_ARN: () => tJ,
            SEMRESATTRS_AWS_ECS_CONTAINER_ARN: () => tY,
            SEMRESATTRS_AWS_ECS_LAUNCHTYPE: () => tq,
            SEMRESATTRS_AWS_ECS_TASK_ARN: () => tz,
            SEMRESATTRS_AWS_ECS_TASK_FAMILY: () => tW,
            SEMRESATTRS_AWS_ECS_TASK_REVISION: () => tV,
            SEMRESATTRS_AWS_EKS_CLUSTER_ARN: () => tZ,
            SEMRESATTRS_AWS_LOG_GROUP_ARNS: () => t0,
            SEMRESATTRS_AWS_LOG_GROUP_NAMES: () => tX,
            SEMRESATTRS_AWS_LOG_STREAM_ARNS: () => t2,
            SEMRESATTRS_AWS_LOG_STREAM_NAMES: () => t1,
            SEMRESATTRS_CLOUD_ACCOUNT_ID: () => tG,
            SEMRESATTRS_CLOUD_AVAILABILITY_ZONE: () => tK,
            SEMRESATTRS_CLOUD_PLATFORM: () => t$,
            SEMRESATTRS_CLOUD_PROVIDER: () => tj,
            SEMRESATTRS_CLOUD_REGION: () => tH,
            SEMRESATTRS_CONTAINER_ID: () => t4,
            SEMRESATTRS_CONTAINER_IMAGE_NAME: () => t5,
            SEMRESATTRS_CONTAINER_IMAGE_TAG: () => t6,
            SEMRESATTRS_CONTAINER_NAME: () => t3,
            SEMRESATTRS_CONTAINER_RUNTIME: () => t8,
            SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: () => t9,
            SEMRESATTRS_DEVICE_ID: () => t7,
            SEMRESATTRS_DEVICE_MODEL_IDENTIFIER: () => An,
            SEMRESATTRS_DEVICE_MODEL_NAME: () => Al,
            SEMRESATTRS_FAAS_ID: () => Au,
            SEMRESATTRS_FAAS_INSTANCE: () => Ap,
            SEMRESATTRS_FAAS_MAX_MEMORY: () => Ag,
            SEMRESATTRS_FAAS_NAME: () => Ac,
            SEMRESATTRS_FAAS_VERSION: () => Ad,
            SEMRESATTRS_HOST_ARCH: () => AE,
            SEMRESATTRS_HOST_ID: () => Ah,
            SEMRESATTRS_HOST_IMAGE_ID: () => Ay,
            SEMRESATTRS_HOST_IMAGE_NAME: () => AC,
            SEMRESATTRS_HOST_IMAGE_VERSION: () => Aw,
            SEMRESATTRS_HOST_NAME: () => Af,
            SEMRESATTRS_HOST_TYPE: () => Am,
            SEMRESATTRS_K8S_CLUSTER_NAME: () => AB,
            SEMRESATTRS_K8S_CONTAINER_NAME: () => AD,
            SEMRESATTRS_K8S_CRONJOB_NAME: () => Aj,
            SEMRESATTRS_K8S_CRONJOB_UID: () => AU,
            SEMRESATTRS_K8S_DAEMONSET_NAME: () => AP,
            SEMRESATTRS_K8S_DAEMONSET_UID: () => AN,
            SEMRESATTRS_K8S_DEPLOYMENT_NAME: () => AM,
            SEMRESATTRS_K8S_DEPLOYMENT_UID: () => Ak,
            SEMRESATTRS_K8S_JOB_NAME: () => AF,
            SEMRESATTRS_K8S_JOB_UID: () => AL,
            SEMRESATTRS_K8S_NAMESPACE_NAME: () => Av,
            SEMRESATTRS_K8S_NODE_NAME: () => A_,
            SEMRESATTRS_K8S_NODE_UID: () => AI,
            SEMRESATTRS_K8S_POD_NAME: () => AQ,
            SEMRESATTRS_K8S_POD_UID: () => AS,
            SEMRESATTRS_K8S_REPLICASET_NAME: () => AR,
            SEMRESATTRS_K8S_REPLICASET_UID: () => AT,
            SEMRESATTRS_K8S_STATEFULSET_NAME: () => AO,
            SEMRESATTRS_K8S_STATEFULSET_UID: () => Ax,
            SEMRESATTRS_OS_DESCRIPTION: () => AH,
            SEMRESATTRS_OS_NAME: () => AK,
            SEMRESATTRS_OS_TYPE: () => AG,
            SEMRESATTRS_OS_VERSION: () => A$,
            SEMRESATTRS_PROCESS_COMMAND: () => Az,
            SEMRESATTRS_PROCESS_COMMAND_ARGS: () => AV,
            SEMRESATTRS_PROCESS_COMMAND_LINE: () => AW,
            SEMRESATTRS_PROCESS_EXECUTABLE_NAME: () => AJ,
            SEMRESATTRS_PROCESS_EXECUTABLE_PATH: () => Aq,
            SEMRESATTRS_PROCESS_OWNER: () => AZ,
            SEMRESATTRS_PROCESS_PID: () => AY,
            SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION: () => A1,
            SEMRESATTRS_PROCESS_RUNTIME_NAME: () => AX,
            SEMRESATTRS_PROCESS_RUNTIME_VERSION: () => A0,
            SEMRESATTRS_SERVICE_INSTANCE_ID: () => A4,
            SEMRESATTRS_SERVICE_NAME: () => A2,
            SEMRESATTRS_SERVICE_NAMESPACE: () => A3,
            SEMRESATTRS_SERVICE_VERSION: () => A8,
            SEMRESATTRS_TELEMETRY_AUTO_VERSION: () => A7,
            SEMRESATTRS_TELEMETRY_SDK_LANGUAGE: () => A6,
            SEMRESATTRS_TELEMETRY_SDK_NAME: () => A5,
            SEMRESATTRS_TELEMETRY_SDK_VERSION: () => A9,
            SEMRESATTRS_WEBENGINE_DESCRIPTION: () => rl,
            SEMRESATTRS_WEBENGINE_NAME: () => rn,
            SEMRESATTRS_WEBENGINE_VERSION: () => ra,
            SemanticResourceAttributes: () => rc,
            TELEMETRYSDKLANGUAGEVALUES_CPP: () => n2,
            TELEMETRYSDKLANGUAGEVALUES_DOTNET: () => n3,
            TELEMETRYSDKLANGUAGEVALUES_ERLANG: () => n4,
            TELEMETRYSDKLANGUAGEVALUES_GO: () => n8,
            TELEMETRYSDKLANGUAGEVALUES_JAVA: () => n5,
            TELEMETRYSDKLANGUAGEVALUES_NODEJS: () => n6,
            TELEMETRYSDKLANGUAGEVALUES_PHP: () => n9,
            TELEMETRYSDKLANGUAGEVALUES_PYTHON: () => n7,
            TELEMETRYSDKLANGUAGEVALUES_RUBY: () => il,
            TELEMETRYSDKLANGUAGEVALUES_WEBJS: () => ic,
            TelemetrySdkLanguageValues: () => iu,
          }));
        var eu = ec(92321),
          ed = "cloud.provider",
          ep = "cloud.account.id",
          eg = "cloud.region",
          eh = "cloud.availability_zone",
          ef = "cloud.platform",
          em = "aws.ecs.container.arn",
          eE = "aws.ecs.cluster.arn",
          eC = "aws.ecs.launchtype",
          ey = "aws.ecs.task.arn",
          ew = "aws.ecs.task.family",
          eB = "aws.ecs.task.revision",
          e_ = "aws.eks.cluster.arn",
          eI = "aws.log.group.names",
          ev = "aws.log.group.arns",
          eS = "aws.log.stream.names",
          eQ = "aws.log.stream.arns",
          eD = "container.name",
          eT = "container.id",
          eR = "container.runtime",
          ek = "container.image.name",
          eM = "container.image.tag",
          ex = "deployment.environment",
          eO = "device.id",
          eN = "device.model.identifier",
          eP = "device.model.name",
          eL = "faas.name",
          eF = "faas.id",
          eU = "faas.version",
          ej = "faas.instance",
          eG = "faas.max_memory",
          eH = "host.id",
          eK = "host.name",
          e$ = "host.type",
          eY = "host.arch",
          eJ = "host.image.name",
          ez = "host.image.id",
          eW = "host.image.version",
          eV = "k8s.cluster.name",
          eZ = "k8s.node.name",
          eX = "k8s.node.uid",
          e0 = "k8s.namespace.name",
          e1 = "k8s.pod.uid",
          e2 = "k8s.pod.name",
          e3 = "k8s.container.name",
          e4 = "k8s.replicaset.uid",
          e8 = "k8s.replicaset.name",
          e5 = "k8s.deployment.uid",
          e6 = "k8s.deployment.name",
          e9 = "k8s.statefulset.uid",
          e7 = "k8s.statefulset.name",
          tn = "k8s.daemonset.uid",
          tl = "k8s.daemonset.name",
          tc = "k8s.job.uid",
          tu = "k8s.job.name",
          td = "k8s.cronjob.uid",
          tp = "k8s.cronjob.name",
          tg = "os.type",
          tf = "os.description",
          tm = "os.name",
          tE = "os.version",
          tC = "process.pid",
          ty = "process.executable.name",
          tw = "process.executable.path",
          tB = "process.command",
          t_ = "process.command_line",
          tI = "process.command_args",
          tv = "process.owner",
          tS = "process.runtime.name",
          tQ = "process.runtime.version",
          tD = "process.runtime.description",
          tT = "service.name",
          tR = "service.namespace",
          tk = "service.instance.id",
          tM = "service.version",
          tx = "telemetry.sdk.name",
          tO = "telemetry.sdk.language",
          tN = "telemetry.sdk.version",
          tP = "telemetry.auto.version",
          tL = "webengine.name",
          tF = "webengine.version",
          tU = "webengine.description",
          tj = ed,
          tG = ep,
          tH = eg,
          tK = eh,
          t$ = ef,
          tY = em,
          tJ = eE,
          tq = eC,
          tz = ey,
          tW = ew,
          tV = eB,
          tZ = e_,
          tX = eI,
          t0 = ev,
          t1 = eS,
          t2 = eQ,
          t3 = eD,
          t4 = eT,
          t8 = eR,
          t5 = ek,
          t6 = eM,
          t9 = ex,
          t7 = eO,
          An = eN,
          Al = eP,
          Ac = eL,
          Au = eF,
          Ad = eU,
          Ap = ej,
          Ag = eG,
          Ah = eH,
          Af = eK,
          Am = e$,
          AE = eY,
          AC = eJ,
          Ay = ez,
          Aw = eW,
          AB = eV,
          A_ = eZ,
          AI = eX,
          Av = e0,
          AS = e1,
          AQ = e2,
          AD = e3,
          AT = e4,
          AR = e8,
          Ak = e5,
          AM = e6,
          Ax = e9,
          AO = e7,
          AN = tn,
          AP = tl,
          AL = tc,
          AF = tu,
          AU = td,
          Aj = tp,
          AG = tg,
          AH = tf,
          AK = tm,
          A$ = tE,
          AY = tC,
          AJ = ty,
          Aq = tw,
          Az = tB,
          AW = t_,
          AV = tI,
          AZ = tv,
          AX = tS,
          A0 = tQ,
          A1 = tD,
          A2 = tT,
          A3 = tR,
          A4 = tk,
          A8 = tM,
          A5 = tx,
          A6 = tO,
          A9 = tN,
          A7 = tP,
          rn = tL,
          ra = tF,
          rl = tU,
          rc = (0, eu.createConstMap)([
            ed,
            ep,
            eg,
            eh,
            ef,
            em,
            eE,
            eC,
            ey,
            ew,
            eB,
            e_,
            eI,
            ev,
            eS,
            eQ,
            eD,
            eT,
            eR,
            ek,
            eM,
            ex,
            eO,
            eN,
            eP,
            eL,
            eF,
            eU,
            ej,
            eG,
            eH,
            eK,
            e$,
            eY,
            eJ,
            ez,
            eW,
            eV,
            eZ,
            eX,
            e0,
            e1,
            e2,
            e3,
            e4,
            e8,
            e5,
            e6,
            e9,
            e7,
            tn,
            tl,
            tc,
            tu,
            td,
            tp,
            tg,
            tf,
            tm,
            tE,
            tC,
            ty,
            tw,
            tB,
            t_,
            tI,
            tv,
            tS,
            tQ,
            tD,
            tT,
            tR,
            tk,
            tM,
            tx,
            tO,
            tN,
            tP,
            tL,
            tF,
            tU,
          ]),
          rd = "alibaba_cloud",
          rp = "aws",
          rg = "azure",
          rh = "gcp",
          rf = rd,
          rm = rp,
          rE = rg,
          rC = rh,
          ry = (0, eu.createConstMap)([rd, rp, rg, rh]),
          rw = "alibaba_cloud_ecs",
          rB = "alibaba_cloud_fc",
          r_ = "aws_ec2",
          rI = "aws_ecs",
          rv = "aws_eks",
          rS = "aws_lambda",
          rQ = "aws_elastic_beanstalk",
          rD = "azure_vm",
          rT = "azure_container_instances",
          rR = "azure_aks",
          rk = "azure_functions",
          rM = "azure_app_service",
          rx = "gcp_compute_engine",
          rO = "gcp_cloud_run",
          rN = "gcp_kubernetes_engine",
          rP = "gcp_cloud_functions",
          rL = "gcp_app_engine",
          rF = rw,
          rU = rB,
          rj = r_,
          rG = rI,
          rH = rv,
          rK = rS,
          r$ = rQ,
          rY = rD,
          rJ = rT,
          rq = rR,
          rz = rk,
          rW = rM,
          rV = rx,
          rZ = rO,
          rX = rN,
          r0 = rP,
          r1 = rL,
          r2 = (0, eu.createConstMap)([
            rw,
            rB,
            r_,
            rI,
            rv,
            rS,
            rQ,
            rD,
            rT,
            rR,
            rk,
            rM,
            rx,
            rO,
            rN,
            rP,
            rL,
          ]),
          r3 = "ec2",
          r4 = "fargate",
          r8 = r3,
          r5 = r4,
          r6 = (0, eu.createConstMap)([r3, r4]),
          r9 = "amd64",
          r7 = "arm32",
          ne = "arm64",
          nc = "ia64",
          nu = "ppc32",
          nd = "ppc64",
          np = "x86",
          ng = r9,
          nh = r7,
          nf = ne,
          nm = nc,
          nE = nu,
          nC = nd,
          ny = np,
          nw = (0, eu.createConstMap)([r9, r7, ne, nc, nu, nd, np]),
          nB = "windows",
          n_ = "linux",
          nI = "darwin",
          nv = "freebsd",
          nS = "netbsd",
          nQ = "openbsd",
          nD = "dragonflybsd",
          nT = "hpux",
          nR = "aix",
          nk = "solaris",
          nM = "z_os",
          nx = nB,
          nO = n_,
          nN = nI,
          nP = nv,
          nL = nS,
          nF = nQ,
          nU = nD,
          nj = nT,
          nG = nR,
          nH = nk,
          nK = nM,
          n$ = (0, eu.createConstMap)([
            nB,
            n_,
            nI,
            nv,
            nS,
            nQ,
            nD,
            nT,
            nR,
            nk,
            nM,
          ]),
          nY = "cpp",
          nJ = "dotnet",
          nq = "erlang",
          nz = "go",
          nW = "java",
          nV = "nodejs",
          nZ = "php",
          nX = "python",
          n0 = "ruby",
          n1 = "webjs",
          n2 = nY,
          n3 = nJ,
          n4 = nq,
          n8 = nz,
          n5 = nW,
          n6 = nV,
          n9 = nZ,
          n7 = nX,
          il = n0,
          ic = n1,
          iu = (0, eu.createConstMap)([nY, nJ, nq, nz, nW, nV, nZ, nX, n0, n1]);
      },
      80221(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { SDK_INFO: () => eg }));
        var eu,
          ed = "1.30.1",
          ep = ec(42152),
          eg =
            (((eu = {})[ep.SEMRESATTRS_TELEMETRY_SDK_NAME] = "opentelemetry"),
            (eu[ep.SEMRESATTRS_PROCESS_RUNTIME_NAME] = "node"),
            (eu[ep.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] =
              ep.TELEMETRYSDKLANGUAGEVALUES_NODEJS),
            (eu[ep.SEMRESATTRS_TELEMETRY_SDK_VERSION] = ed),
            eu);
      },
      39858(eA, el, ec) {
        "use strict";
        function defaultServiceName() {
          return "unknown_service:" + process.argv0;
        }
        (ec.r(el), ec.d(el, { defaultServiceName: () => defaultServiceName }));
      },
      92321(eA, el, ec) {
        "use strict";
        function createConstMap(eA) {
          for (var el = {}, ec = eA.length, eu = 0; eu < ec; eu++) {
            var ed = eA[eu];
            ed && (el[String(ed).toUpperCase().replace(/[-.]/g, "_")] = ed);
          }
          return el;
        }
        (ec.r(el), ec.d(el, { createConstMap: () => createConstMap }));
      },
    },
    cache = new Map();
  function getModule(id: number): any {
    if (id === 2339) return { diag: runtime.diag };
    if (cache.has(id)) return cache.get(id);
    if (!factories[id]) throw Error("Unknown Resource module: " + id);
    const m = { exports: {} };
    cache.set(id, m.exports);
    factories[id](m, m.exports, getModule);
    return m.exports;
  }
  getModule.r = (o: any) =>
    Object.defineProperty(o, "__esModule", { value: true });
  getModule.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  return { ...getModule(78766), ...getModule(80221), getModule };
}
