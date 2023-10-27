declare namespace Express {
    export interface Request {
        user: {
            id: number;
            name: string;
            admin: string;
            key: string;
            expires: string;
        };
    }
}
