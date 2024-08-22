import * as Puppeteer from 'puppeteer';

export class ScrapperService {
    public constructor() {

    }

    public async scrap(url: string): Promise<string> {
        console.log("Will scrap: " + url);
        const browser = await Puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        await page.waitForNetworkIdle({ idleTime: 2000 });

        const el = await page.$$(".flex.flex-row.flex-wrap.justify-start.grow-0.shrink-0.basis-full.min-w-0.box-border.gap-y-4.items-stretch");
        let text = "";

        if (el.length > 0) {
            const els = await el[0].$$eval("*", el => el.map(e => e.textContent ?? ""));

            text = els.join(" ");
        }

        await browser.close();

        return text;
    }
}