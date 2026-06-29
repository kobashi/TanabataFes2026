const { getInactiveUpstream } = require("./upstream-state");

process.env.TARGET = process.env.TARGET || `http://${getInactiveUpstream()}`;

require("./smoke-test");
