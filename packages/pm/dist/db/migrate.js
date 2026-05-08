"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
/**
 * Migration runner delegate.
 *
 * The migration infrastructure has moved to @cleandev/db.
 * This module re-exports runMigrations for backward compatibility.
 */
var db_1 = require("@cleandev/db");
Object.defineProperty(exports, "runMigrations", { enumerable: true, get: function () { return db_1.runMigrations; } });
