import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";


export const getCurrentState = async (userid: any) => {
    const serverList = await Server.findAll(userid);
    let combinedData = serverList.map(async server => {
      let res = await LiveServer.findOne({
        where: { serverid: server.id },
        attributes: ['status', 'sslstatus'],
        order: [["time", "DESC"]],
      });
      Object.assign(server.dataValues, res?.dataValues);
      return server;
    })

    return await Promise.all(combinedData);
}

