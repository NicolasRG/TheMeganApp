import { createServer } from "http";
import { Server } from "socket.io";

import  fs from 'fs';
import http from 'http';
import https from 'https';
import  express from "express";
import {GetApiRoutes} from "./services/api.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


var privateKey  = fs.readFileSync('certs/private.key');
var certificate = fs.readFileSync('certs/certificate.crt');
var credentials = {key: privateKey, cert: certificate};
//map to keep track of open rooms
//keys will be the room code
const rooms = {}

var app = express();
var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app);
let io = null;
if(process.env.secure){
    io = new Server(httpsServer, {
        // options
        cors: {
          origin: "*", //todo update this incase bullshit starts happening
          methods: ["GET", "POST"],
        }
      });
}else{
    io = new Server(httpServer, {
        // options
        cors: {
          origin: "*", //todo update this incase bullshit starts happening
          methods: ["GET", "POST"],
        }
      });
}
//socket io setup
//cookie 
app.use(cookieParser());
//express routes 
app.use(GetApiRoutes(rooms, io))

//serve static filses
app.use('/', express.static('dist/triviaui'))

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'dist/triviaui/index.html'));
})


//server general flow : 
/*once the user has connected listen for checkin and create
 once in the room they can send commands to the service through the events they pass*/
io.on("connection", (socket) => {
    console.log(socket.id, "socket connected");

    socket.on("checkin", (token)=>{
        console.log("checkin", token);
        if(!rooms[token.roomCode]){
            socket.emit("notCheckedIn", token)
            return
        }
        rooms[token.roomCode].addPlayer(socket.id, token)
    });

    socket.on("presenterCheckin", (token) =>{
        console.log("presenterCheckin", token)
        //may need to lock the room state when this is triggered as to not create micrsecond race conditions
        try{
            rooms[token.roomCode].registerPresenter(socket.id, token)
        }catch(err){
            console.log(err)
        }
    })

    socket.on("startGame", (token) =>{
        console.log("startGame", token)
        //may need to lock the room state when this is triggered as to not create micrsecond race conditions
        try{
            rooms[token.roomCode].startGame(socket.id, token.jwt)
        }catch(err){
            console.log(err)
        }
        
    })

    //todo verify that this shit works
    socket.on("submitAnswer", (token)=>{
        console.log("submitAnswer", token)
        rooms[token.roomCode].emitSubmitAnswer(token)
    })

    socket.on("disconnect", (reason) => {
        console.log("disconnected",reason, "going to look for room ");
        //have to search through rooms map and look for the player
        //should update this to be locall held somewhere :/
        Object.keys(rooms).forEach( key=>{
            let room  = rooms[key];
            Object.keys(room.players).forEach( player =>{
                if(player == socket.id){
                    room.removePlayer(socket.id)
                }
            })
        })
        //todo handle presenter leaving
      });
});







//Start the express server here TODO link up with socket service as well

httpServer.listen(80);
console.log("socket listening on port 80")

// // your express configuration here
// httpServer1.listen(80);
// console.log("listening on post 80")
httpsServer.listen(443);
console.log("listening on post 443")






