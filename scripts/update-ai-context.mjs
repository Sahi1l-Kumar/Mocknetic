import { execSync } from "node:child_process";
import fs from "node:fs";

const CONTEXT_FILE = "AI_CONTEXT.md";

const START = "<!-- AI:STRUCTURE:START -->";
const END = "<!-- AI:STRUCTURE:END -->";

const PRUNE_DIRS = ["node_modules", ".next", ".git", "components/ui"];

const pruneExpr = PRUNE_DIRS.map(
  (d) => `-path "./${d}" -o -path "./${d}/*"`
).join(" -o ");

const command = `
find . \\( ${pruneExpr} \\) -prune -o -print
`.trim();

const paths = execSync(command, {
  encoding: "utf-8",
  maxBuffer: 10 * 1024 * 1024,
})
  .split("\n")
  .filter(Boolean)
  .map((p) => p.replace(/^\.\//, ""))
  .filter((p) => p !== ".")
  .sort();

// Build tree
const tree = [];
const seen = new Set();

for (const path of paths) {
  const parts = path.split("/");
  let acc = "";

  parts.forEach((part, depth) => {
    acc += (depth ? "/" : "") + part;
    if (!seen.has(acc)) {
      seen.add(acc);
      tree.push("│   ".repeat(depth) + "├── " + part);
    }
  });
}

const structureBlock = [
  "",
  "## 📁 Project File Structure (auto-generated)",
  "",
  START,
  "```",
  ...tree,
  "```",
  END,
  "",
].join("\n");

// Read existing file (or create if missing)
let content = "";
if (fs.existsSync(CONTEXT_FILE)) {
  content = fs.readFileSync(CONTEXT_FILE, "utf-8");
}

// CASE 1: markers exist → replace
if (content.includes(START) && content.includes(END)) {
  content = content.split(START)[0] + structureBlock + content.split(END)[1];

  // CASE 2: markers missing → append
} else {
  content += structureBlock;
}

fs.writeFileSync(CONTEXT_FILE, content);

console.log("✅ AI_CONTEXT.md updated (structure inserted or replaced)");
