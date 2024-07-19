import { WebsocketServerTransport } from "rsocket-websocket-server";
import StringCodec from "./StringCodec.js";
import { RSocketResponder } from "rsocket-messaging";
import { RxRespondersFactory } from "rsocket-adapter-rxjs";
import { RSocketServer } from "rsocket-core";
import EchoService from "../echo/EchoService.js";
import { Logger } from "pino";

export default function makeServer({ logger, port, host }: { logger: Logger, port: number, host: string }) {
    const stringCodec = new StringCodec();
    return new RSocketServer({
        transport: new WebsocketServerTransport({
            host: host,
            port: port,
        }),
        acceptor: {
            accept: async () => {
                const echoService = new EchoService(logger);
                return RSocketResponder.builder()
                    .route(
                        "EchoService.log",
                        RxRespondersFactory.fireAndForget(
                            echoService.handleLogFireAndForget,
                            stringCodec
                        )
                    )
                    .route(
                        "EchoService.echo",
                        RxRespondersFactory.requestResponse(
                            echoService.handleEchoRequestResponse,
                            { inputCodec: stringCodec, outputCodec: stringCodec }
                        )
                    )
                    .route(
                        "EchoService.echoStream",
                        RxRespondersFactory.requestStream(
                            echoService.handleEchoRequestStream,
                            { inputCodec: stringCodec, outputCodec: stringCodec }
                        )
                    )
                    .route(
                        "EchoService.echoChannel",
                        RxRespondersFactory.requestChannel(
                            echoService.handleEchoRequestChannel,
                            { inputCodec: stringCodec, outputCodec: stringCodec },
                            4
                        )
                    )
                    .build();
            },
        },
    });
}