const esbuild = require("esbuild");

async function main() {
  await esbuild.build({
    entryPoints: ["./dist/server/server.js"],
    outfile: "./dist/worker.js",
    bundle: true,
    format: "esm",
    platform: "node",
    plugins: [
      {
        name: "stub-node-builtins",
        setup(build) {
          build.onResolve({ filter: /^node:(fs|os|path|async_hooks)(\/.*)?$/ }, (args) => {
            return { path: args.path, namespace: "cf-stub" };
          });
          build.onLoad({ filter: /.*/, namespace: "cf-stub" }, (args) => {
            const mod = args.path.replace("node:", "");
            const stubs = {
              fs: `
                export default {};
                export const existsSync = () => false;
                export const readFileSync = () => "";
                export const readFile = async () => "";
                export const writeFileSync = () => {};
                export const writeFile = async () => {};
                export const mkdirSync = () => {};
                export const mkdir = async () => {};
                export const accessSync = () => {};
                export const statSync = () => ({ isFile: () => false, isDirectory: () => false });
                export const lstatSync = () => ({ isFile: () => false, isDirectory: () => false });
                export const fstatSync = () => ({});
                export const realpathSync = () => "";
                export const readdirSync = () => [];
                export const readdir = async () => [];
                export const appendFileSync = () => {};
                export const unlinkSync = () => {};
                export const copyFileSync = () => {};
                export const createReadStream = () => ({});
                export const createWriteStream = () => ({});
                export const ReadStream = {};
                export const WriteStream = {};
                export const constants = {};
              `,
              "fs/promises": `
                export default {};
                export const readFile = async () => "";
                export const writeFile = async () => {};
                export const mkdir = async () => {};
                export const readdir = async () => [];
                export const unlink = async () => {};
                export const access = async () => {};
                export const copyFile = async () => {};
                export const stat = async () => ({ isFile: () => false, isDirectory: () => false });
                export const lstat = async () => ({ isFile: () => false, isDirectory: () => false });
                export const appendFile = async () => {};
                export const realpath = async () => "";
              `,
              os: `
                export default {};
                export const homedir = () => "/tmp";
                export const tmpdir = () => "/tmp";
                export const platform = () => "linux";
                export const type = () => "Linux";
                export const release = () => "";
                export const hostname = () => "localhost";
                export const arch = () => "x64";
                export const cpus = () => [];
                export const freemem = () => 0;
                export const totalmem = () => 0;
                export const EOL = "\\n";
                export const endianness = () => "LE";
              `,
              "async_hooks": `
                export default {};
                export const AsyncLocalStorage = class { getStore() {} run(store, cb) { return cb(); } disable() {} enable() {} };
                export const AsyncResource = class { bind(fn) { return fn; } };
                export const executionAsyncId = () => 0;
                export const triggerAsyncId = () => 0;
                export const createHook = () => ({ enable() {}, disable() {} });
              `,
              path: `
                export default {};
                export const sep = "/";
                export const delimiter = ":";
                export const join = (...args) => args.join("/");
                export const resolve = (...args) => args.join("/");
                export const dirname = (p) => { if (!p) return "."; const s = p.split("/"); s.pop(); return s.join("/") || "."; };
                export const basename = (p) => { if (!p) return ""; return p.split("/").pop(); };
                export const extname = (p) => { if (!p) return ""; const d = p.split("."); return d.length > 1 ? "." + d.pop() : ""; };
                export const relative = (from, to) => to;
                export const isAbsolute = (p) => p ? p.startsWith("/") : false;
                export const normalize = (p) => p || "";
                export const format = () => "";
                export const parse = () => ({ root: "/", dir: "", base: "", name: "", ext: "" });
                export const win32 = undefined;
                export const posix = undefined;
              `,
            };
            const base = mod.includes("/") ? mod : mod;
            return {
              contents: stubs[base] || "export default {};",
              loader: "js",
            };
          });
        },
      },
    ],
  });
  console.log("✓ Worker bundle built: dist/worker.js");
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
