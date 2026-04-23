const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { Writable } = require("stream");

const { expandTemplate, formatUsage, parseInvocation, run } = require("../src/dispatcher");
const { suggestAlias } = require("../src/suggest");

function createStdoutCapture() {
  let output = "";

  return {
    get output() {
      return output;
    },
    stream: new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      }
    })
  };
}

test("expandTemplate injects arguments and defaults", () => {
  const command = expandTemplate("head -n {{2|50}} {{1}}", ["README.md"]);
  assert.equal(command, 'head -n 50 README.md');
});

test("parseInvocation extracts dry and explain flags", () => {
  const parsed = parseInvocation(["gs", "--dry", "--explain"]);
  assert.equal(parsed.alias, "gs");
  assert.equal(parsed.flags.dryRun, true);
  assert.equal(parsed.flags.explain, true);
});

test("suggestAlias returns the closest match", () => {
  assert.equal(suggestAlias("gss", ["gs", "gd", "ga"]), "gs");
});

test("formatUsage renders standalone aliases without the sped prefix", () => {
  assert.equal(
    formatUsage({ commandName: "h", invokedAsStandalone: true }, "h", "<file> [n]"),
    "Usage: h <file> [n]"
  );
});

test("run supports the standalone h entrypoint", async () => {
  const capture = createStdoutCapture();
  const code = await run(["h", "README.md", "1"], {
    commandName: "h",
    cwd: path.resolve(__dirname, ".."),
    invokedAsStandalone: true,
    stdout: capture.stream
  });

  assert.equal(code, 0);
  assert.equal(capture.output.trim(), "# sped-cli");
});

test("run prints version for the sped-cli shim", async () => {
  const capture = createStdoutCapture();
  const code = await run(["-v"], {
    commandName: "sped-cli",
    stdout: capture.stream
  });

  assert.equal(code, 0);
  assert.equal(capture.output.trim(), "0.1.0");
});
