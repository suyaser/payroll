var cmd = require('node-cmd');
const env = process.env.NODE_ENV || "development";

if (env === "development")
    cmd.run('npm run d-client');
else
    cmd.run('npm run client');