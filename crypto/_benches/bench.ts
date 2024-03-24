#!/usr/bin/env -S deno bench
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { crypto as stdCrypto, DIGEST_ALGORITHM_NAMES } from "../mod.ts";

import nodeCrypto from "node:crypto";

import { crypto as oldCrypto } from "https://deno.land/std@0.220.1/crypto/mod.ts";

const webCrypto = globalThis.crypto;

const BENCHMARKED_DIGEST_ALGORITHM_NAMES = [
  "SHA-256",
  "SHA-512",
  "BLAKE3",
  "FNV32A",
  "FNV64A",
] satisfies (typeof DIGEST_ALGORITHM_NAMES[number])[];

const WEB_CRYPTO_DIGEST_ALGORITHM_NAMES = [
  "SHA-1",
  "SHA-256",
  "SHA-384",
  "SHA-512",
] satisfies (typeof DIGEST_ALGORITHM_NAMES[number])[];

const NODE_CRYPTO_DIGEST_ALGORITHM_NAMES = [
  "MD4",
  "MD5",
  "RIPEMD-160",
  "SHA-1",
  "SHA-224",
  "SHA-256",
  "SHA-384",
  "SHA-512",
] satisfies (typeof DIGEST_ALGORITHM_NAMES[number])[];

for (
  const [length, humanLength] of [
    [64, "64 B"],
    [262_144, "256 KiB"],
    [4_194_304, "4 MiB"],
    [67_108_864, "64 MiB"],
    [524_291_328, "512 MiB"],
  ] as const
) {
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = (i + (i % 13) + (i % 31)) % 256;
  }

  for (const name of BENCHMARKED_DIGEST_ALGORITHM_NAMES) {
    Deno.bench({
      group: `${humanLength} with ${name}`,
      name: `std/crypto Wasm digesting ${humanLength} with ${name}`,
      baseline: true,
      async fn() {
        await stdCrypto.subtle.digest(name, [buffer]);
      },
    });

    if (
      (WEB_CRYPTO_DIGEST_ALGORITHM_NAMES as readonly string[]).includes(name)
    ) {
      Deno.bench({
        group: `${humanLength} with ${name}`,
        name: `runtime WebCrypto digesting ${humanLength} with ${name}`,
        async fn() {
          await webCrypto.subtle.digest(name, buffer);
        },
      });
    }

    if (
      (NODE_CRYPTO_DIGEST_ALGORITHM_NAMES as readonly string[]).includes(name)
    ) {
      const nodeName = name.replace("-", "").toLowerCase();

      Deno.bench({
        group: `${humanLength} with ${name}`,
        name: `runtime node:crypto digesting ${humanLength} with ${name}`,
        fn() {
          nodeCrypto.createHash(nodeName).update(buffer).digest();
        },
      });
    }
  }

  for (const name of ["FNV32A", "FNV64A"] as const) {
    Deno.bench({
      group: `${humanLength} with ${name}`,
      name:
        `std/crypto TypeScript (from v0.220.1) digesting ${humanLength} with ${name}`,
      async fn() {
        await oldCrypto.subtle.digest(name, buffer);
      },
    });
  }
}
