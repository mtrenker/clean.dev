#!/usr/bin/env node
import { chmod, readFile, rename, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const [vaultName, itemName] = process.argv.slice(2);

if (!vaultName || !itemName) {
  console.error("Usage: pnpm pass:provision VAULT_NAME ITEM_NAME");
  process.exit(1);
}

const runPass = (args, { input, sensitive = false } = {}) => {
  const result = spawnSync("pass-cli", args, {
    encoding: "utf8",
    input,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error?.code === "ENOENT") {
    throw new Error("pass-cli not found; install pass-cli 2.3.3 before provisioning");
  }
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = sensitive ? "output withheld because secret input was supplied" : result.stderr.trim();
    throw new Error(`pass-cli failed: ${detail || `exit ${result.status}`}`);
  }
  return result.stdout;
};

const parseRecords = (output, key) => {
  const parsed = JSON.parse(output);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed[key])) return parsed[key];
  const capitalized = key[0].toUpperCase() + key.slice(1);
  if (Array.isArray(parsed[capitalized])) return parsed[capitalized];
  throw new Error(`Unexpected pass-cli ${key} JSON output`);
};

const get = (record, ...keys) => keys.map((key) => record[key]).find((value) => typeof value === "string" && value);

const promptHidden = (label) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY || !process.stdout.isTTY || typeof process.stdin.setRawMode !== "function") {
    reject(new Error("Secret prompts require an interactive terminal"));
    return;
  }

  let value = "";
  const wasRaw = process.stdin.isRaw;
  process.stdout.write(`${label}: `);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  const finish = (error) => {
    process.stdin.off("data", onData);
    process.stdin.setRawMode(Boolean(wasRaw));
    process.stdin.pause();
    process.stdout.write("\n");
    if (error) reject(error);
    else resolve(value);
  };

  const onData = (chunk) => {
    for (const character of chunk) {
      if (character === "\u0003" || character === "\u0004") return finish(new Error("Cancelled"));
      if (character === "\r" || character === "\n") return finish();
      if (character === "\u007f" || character === "\b") value = value.slice(0, -1);
      else value += character;
    }
  };

  process.stdin.on("data", onData);
});

const main = async () => {
  const envPassDisplayPath = "apps/web/.env.pass";
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const envPassPath = resolve(repositoryRoot, envPassDisplayPath);
  const envPass = await readFile(envPassPath, "utf8");
  const fields = envPass
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1])
    .filter(Boolean);

  if (fields.length === 0) throw new Error(`${envPassDisplayPath} contains no secret fields`);
  const duplicateFields = [...new Set(fields.filter((field, index) => fields.indexOf(field) !== index))];
  if (duplicateFields.length > 0) {
    throw new Error(`${envPassDisplayPath} contains duplicate fields: ${duplicateFields.join(", ")}`);
  }

  const listItems = () => parseRecords(runPass([
    "item", "list", "--vault-name", vaultName, "--output", "json",
  ]), "items");
  const titleOf = (item) => get(item, "title", "item_title", "itemTitle", "ItemTitle", "name", "Name");
  if (listItems().some((item) => titleOf(item) === itemName)) {
    throw new Error(`Item already exists: ${vaultName}/${itemName}`);
  }

  const template = JSON.parse(runPass(["item", "create", "custom", "--get-template"]));
  if (!Array.isArray(template.sections)) {
    throw new Error("Unsupported pass-cli custom item template");
  }

  const values = [];
  for (const field of fields) {
    let value = "";
    while (!value) {
      value = await promptHidden(field);
      if (!value) console.error(`${field} cannot be empty.`);
    }
    values.push([field, value]);
  }

  const payload = {
    ...template,
    title: itemName,
    sections: [{
      section_name: "Environment",
      fields: values.map(([fieldName, value]) => ({ field_name: fieldName, field_type: "hidden", value })),
    }],
  };

  runPass(
    ["item", "create", "custom", "--vault-name", vaultName, "--from-template", "-"],
    { input: JSON.stringify(payload), sensitive: true },
  );

  const references = envPass.replace(/^([A-Z][A-Z0-9_]*)=.*$/gm, (_, fieldName) => (
    `${fieldName}=pass://${vaultName}/${itemName}/${fieldName}`
  ));
  const temporaryFile = `${envPassPath}.tmp-${process.pid}`;
  await writeFile(temporaryFile, references, { mode: 0o600, flag: "wx" });
  await rename(temporaryFile, envPassPath);
  await chmod(envPassPath, 0o644);

  console.log(`Created ${vaultName}/${itemName} and updated ${envPassDisplayPath}.`);
};

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
