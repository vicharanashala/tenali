'use strict';
// Shared in-memory question stores populated by server/index.js at startup.
// Router files import this module and read from it after initData() fills it.
const banks = { gk: [], vocab: [], concepts: [] };
module.exports = banks;
