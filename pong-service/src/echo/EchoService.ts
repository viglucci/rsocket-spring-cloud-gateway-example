import { Logger } from "pino";
import {
    map,
    Observable,
    of,
    tap,
    timer,
    interval
} from "rxjs";

export default class EchoService {
    logger: Logger;
    constructor(parentLogger: Logger) {
        this.logger = parentLogger.child({ component: "EchoServer" });
    }

    handleEchoRequestResponse(data: string): Observable<string> {
        return timer(1000).pipe(map(() => `Echo: ${data}`));
    }

    handleEchoRequestStream(data: string): Observable<string> {
        return interval(1000).pipe(
            map(() => `RxEchoService Echo: ${data}`),
            tap((value) => {
                this.logger.info(`[server] sending: ${value}`);
            })
        );
    }

    handleEchoRequestChannel(datas: Observable<string>): Observable<string> {
        datas
            .pipe(
                tap((value) => {
                    this.logger.info(`[server] receiving: ${value}`);
                })
            )
            .subscribe();
        return interval(200).pipe(
            map((data) => `RxEchoService Echo: ${data}`),
            tap((value) => {
                this.logger.info(`[server] sending: ${value}`);
            })
        );
    }

    handleLogFireAndForget(data: string): Observable<void> {
        this.logger.info(`[server] received: ${data}`);
        return of();
    }
}