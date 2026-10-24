import assert from "node:assert/strict";
type Factory = (runtime?: any) => any;
export const hostExternalOpenerScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "absent delegate returns false; delegate receives URL after notification",
    async (factory) => {
      const api = factory({ process: { env: {} } });
      const opener = new api.WorkbuddyHostExternalUriOpener();
      const events: any[] = [];
      const subscription = opener.urlSubject.subscribe((url: string) =>
        events.push(["url", url]),
      );
      assert.equal(await opener.open("https://owned.invalid"), false);
      assert.equal(events.length, 0);
      api.setWorkbuddyExternalUriOpenDelegate(async (url: string) => {
        events.push(["open", url]);
      });
      assert.equal(await opener.open("https://owned.invalid"), true);
      assert.deepEqual(events, [
        ["url", "https://owned.invalid"],
        ["open", "https://owned.invalid"],
      ]);
      api.setWorkbuddyExternalUriOpenDelegate(undefined);
      assert.equal(await opener.open("https://owned.invalid"), false);
      subscription.unsubscribe();
      opener.urlSubject.complete();
    },
  ],
  [
    "false delegate warns while rejected delegate is swallowed; both return true",
    async (factory) => {
      const warnings: any[] = [];
      const api = factory({
        process: { env: {} },
        console: { warn: (...args: any[]) => warnings.push(args) },
      });
      const opener = new api.WorkbuddyHostExternalUriOpener();
      api.setWorkbuddyExternalUriOpenDelegate(async () => false);
      assert.equal(await opener.open("https://owned.invalid"), true);
      assert.equal(warnings.length, 1);
      api.setWorkbuddyExternalUriOpenDelegate(async () => {
        throw Error("owned rejection");
      });
      assert.equal(await opener.open("https://owned.invalid"), true);
      assert.equal(warnings.length, 1);
      opener.urlSubject.complete();
    },
  ],
  [
    "original mock rejection skips delegate; factory instances isolate delegate state",
    async (factory) => {
      let calls = 0;
      const api = factory({
        process: { env: { WORKBUDDY_MOCK_OPEN_EXTERNAL_REJECT: "1" } },
      });
      const other = factory({ process: { env: {} } });
      api.setWorkbuddyExternalUriOpenDelegate(() => {
        calls++;
      });
      const opener = new api.WorkbuddyHostExternalUriOpener();
      assert.equal(await opener.open("https://owned.invalid"), true);
      assert.equal(calls, 0);
      await assert.rejects(
        api.openExternalWithLocalMock("https://owned.invalid"),
        /mock shell.openExternal reject/,
      );
      const isolated = new other.WorkbuddyHostExternalUriOpener();
      assert.equal(await isolated.open("https://owned.invalid"), false);
      opener.urlSubject.complete();
      isolated.urlSubject.complete();
    },
  ],
];
