require("dotenv").config();
import { sequelize } from "./Models/index";
import { Client } from "pg";
import { Role } from "./Models/role.model";
import Permission from "./Models/permission.model";

export const seedDb = async () => {
    await sequelize.sync({ force: false });
    const client = new Client({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT),
        database: process.env.DATABASE,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PW,
    });

    try {
        await client.connect();
        console.log("Connected.");
        console.log("Attempting to create_hypertable...");
        let addExtension = await client.query(
            `CREATE EXTENSION IF NOT EXISTS timescaledb;`
        );
        console.log("ADD EXTENSION RESPONSE: ", addExtension)
        let hypRes = await client.query(
            `SELECT create_hypertable('"liveserver"', 'time', if_not_exists => TRUE);`
        );
        console.log("Hypertable Creation Response: ", hypRes);

        const adminRole = await Role.create({ name: 'admin' });
        const createPostPermission = await Permission.create({ name: 'create_server' });
        const editPostPermission = await Permission.create({ name: 'edit_server' });

        await adminRole.$add('permissions', createPostPermission);
        await adminRole.$add('permissions', editPostPermission);
    } catch (err) {
        console.log("ERR IS: ", err);
    }
}