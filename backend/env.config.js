import dotenv from 'dotenv';
import path from 'path';

class Env {
    static dotEnvDefault = ".env";
    static dotEnvDevelopment = ".env.development";
    static dotEnvProduction = ".env.production";

    constructor() {
        dotenv.config({
            path: path.resolve(process.cwd(), ".env"),
        });

        const envFile = (process.env.NODE_ENV === "production") ? ".env.production" : ".env.development";

        dotenv.config({
            path: path.resolve(process.cwd(), envFile)
        });
    }
}

export default Env;
