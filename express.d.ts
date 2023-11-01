declare namespace Express {
    export interface Request {
        user: {
            id: number;
            name: string;
            team: number;
            admin: string;
            key: string;
            expires: string;
            teamAdmin: number;
        };
    }
}
