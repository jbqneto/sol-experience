type Project = {
    traderPublicKey: string;
    initialBuy: number;
    symbol: string;
    uri: string;
    name: string;
    marketCap: number;
}

class PumpfunService {

    private projects: Project[] = [];
    public static instance: PumpfunService | null = null;

    private constructor() {

    }

    public static getInstance() {
        if (this.instance === null) {
            this.instance = new PumpfunService();
        }

        return this.instance;
    }

    public addProject(project: Project) {
        this.projects.push(project);
    }

    public getProjects(): Project[] {
        return this.projects;
    }

}

export const pumpfunService = PumpfunService.getInstance();