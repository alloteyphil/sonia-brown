/**
 * Regenerates convex/_generated without contacting a Convex deployment, using
 * Convex's own codegen templates. `npx convex dev` produces the same files, so
 * this is only needed for offline type-checking / CI.
 */
import fs from "node:fs";
import path from "node:path";
const T = "../node_modules/convex/dist/esm/cli/codegen_templates/";
const { apiCodegen } = await import(new URL(T + "api.js", import.meta.url));
const { serverCodegen } = await import(new URL(T + "server.js", import.meta.url));

const DATA_MODEL = `/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run \`npx convex dev\`.
 * @module
 */
import type { DataModelFromSchemaDefinition, DocumentByName, TableNamesInDataModel, SystemTableNames } from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema.js";

export type TableNames = TableNamesInDataModel<DataModel>;
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>;
export type Id<TableName extends TableNames | SystemTableNames> = GenericId<TableName>;
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
`;

const dir = path.resolve("convex");
const out = path.join(dir, "_generated");
fs.mkdirSync(out, { recursive: true });

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return e.name === "_generated" ? [] : walk(p);
    return /\.(ts|js)$/.test(e.name) && !e.name.endsWith(".d.ts") && !e.name.includes(".test.") ? [p] : [];
  });
}
const skip = new Set(["schema.ts", "auth.config.ts", "convex.config.ts"]);
const modules = walk(dir)
  .map((p) => path.relative(dir, p).replace(/\\/g, "/"))
  .filter((p) => !skip.has(p))
  .sort();

const api = apiCodegen(modules, { useTypeScript: false });
const server = serverCodegen({ useTypeScript: false });
fs.writeFileSync(path.join(out, "api.d.ts"), api.DTS);
fs.writeFileSync(path.join(out, "api.js"), api.JS);
fs.writeFileSync(path.join(out, "server.d.ts"), server.DTS);
fs.writeFileSync(path.join(out, "server.js"), server.JS);
fs.writeFileSync(path.join(out, "dataModel.d.ts"), DATA_MODEL);
console.log("Generated convex/_generated for", modules.length, "modules");
