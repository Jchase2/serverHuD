import io  from '../index';
import { isUp, getSslDetails } from '../Utils/serverDetails';
import { Socket } from "socket.io";


function testIo (socket: Socket, url: string){
    console.log("TEST")
    setInterval(async function(){
        let result = await isUp('http://jamesdchase.com');
        console.log("RESULT IS: ", result)
        socket.emit('status-update', result);
      }, 60000)
}