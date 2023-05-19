import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";

export const getAllCombinedState = async (userid: any) => {
  const serverList = await Server.findAll(userid);
  let combinedData = serverList.map(async (server) => {
    let res = await LiveServer.findOne({
      where: { serverid: server.id },
      attributes: ["status", "sslStatus"],
      order: [["time", "DESC"]],
    });
    Object.assign(server.dataValues, res?.dataValues);
    return server;
  });

  return await Promise.all(combinedData);
};

export const getOneCombinedState = async (serverid: any) => {
  const server = await Server.findOne({ where: { id: serverid } });
  let res = await LiveServer.findOne({
    where: { serverid: serverid },
    attributes: ["status", "sslStatus"],
    order: [["time", "DESC"]],
  });

  Object.assign(server?.dataValues, res?.dataValues);

  console.log("server datavalues", server?.dataValues);
  console.log("RES DATAVALS: ", res?.dataValues)

  return server;
};
