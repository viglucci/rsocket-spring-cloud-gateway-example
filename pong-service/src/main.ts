import { Closeable } from "rsocket-core";
import { exit } from "process";
import { pino } from "pino";
import closeWithGrace from "close-with-grace";
import makeServer from "./rsocket/makeServer.js";

let serverCloseable: Closeable;

async function main() {
    const host = '127.0.0.1';
    const port = 8081;
    const logger = pino();
    const server = makeServer({ logger, port, host });
    serverCloseable = await server.bind();
    logger.info(`Server bound on ${host}:${port}`);
    const closeablePromise = new Promise((resolve, reject) => {
        serverCloseable.onClose(() => {
            logger.info(`Server closed`);
            resolve(null);
        });
    });
    closeWithGrace({ delay: 2000 }, async function ({ signal, err, manual }) {
        logger.info(`Received interupt signal`);
        if (err) {
            logger.error(err)
        }
        serverCloseable.close();
        return closeablePromise;
    });
}

main().catch((error: Error) => {
    console.error(error);
    exit(1);
});
