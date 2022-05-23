/* eslint-disable no-console */
require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

const init = async () => {
    const server = await createServer(container);
    await server.start();
    console.log(`server start at ${server.info.uri}`);
};

init().then();
