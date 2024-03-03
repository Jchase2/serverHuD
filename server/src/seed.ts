require("dotenv").config();
import { sequelize } from "./Models/index";
import { Client } from "pg";
import bcrypt from "bcrypt";
import { User } from "./Models/user.model";
import { createPermission, createRole, getPermissionIdByName, getPermissionIds, getRoleIdByName } from "./Utils/roleManagement";

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
    // Ensure liveserver is a hypertable
    await client.connect();
    console.log("Connected.");
    console.log("Attempting to create_hypertable...");
    let addExtension = await client.query(
      `CREATE EXTENSION IF NOT EXISTS timescaledb;`
    );
    console.log("ADD EXTENSION RESPONSE: ", addExtension);
    let hypRes = await client.query(
      `SELECT create_hypertable('"liveserver"', 'time', if_not_exists => TRUE);`
    );
    console.log("Hypertable Creation Response: ", hypRes);

    // Create default roles and permissions.
    const createServerPermId = await createPermission("create_server");
    const editServerPermId = await createPermission("update_server");
    const deleteServerPermId = await createPermission("delete_server");
    await createPermission("enable_disable_registration")
    const permIds = await getPermissionIds();
    await createRole("admin", permIds);
    await createRole("user", [createServerPermId, editServerPermId, deleteServerPermId])
    await createRole("viewer", [])
    // Get adminRoleId
    const adminRoleId = await getRoleIdByName("admin");
    const hash = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASS || "password", 10);
    // Create default admin account
    User.findOrCreate({
      where: {
        email: process.env.ADMIN_EMAIL || "fakeEmail@example.com",
        password: hash,
        roleId: adminRoleId
      },
    });
  } catch (err) {
    console.log("ERR IS: ", err);
  }
};