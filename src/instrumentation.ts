import { pumpfunService } from '@/service/pumpfun.service';
import WebSocket from 'ws';

export function register() {

    const ws = new WebSocket('wss://pumpportal.fun/api/data');

    ws.on('open', function open() {

        // Subscribing to token creation events
        let payload: any = {
            method: "subscribeNewToken",
        }

        ws.send(JSON.stringify(payload));
    });

    ws.on('message', function message(response: any) {
        const data: any = JSON.parse(response);
        pumpfunService.addProject({
            name: data.name,
            uri: data.uri,
            symbol: data.symbol,
            initialBuy: data.initialBuy,
            marketCap: data.marketCapSol,
            traderPublicKey: data.traderPublicKey
        })
    });
}