//settup the routes needed facilate whatever bs
//needs to have a connection to the socket server for presenter
import { Router} from "express";
import { makeid } from "../utils/roomcodegen.js";
import { GameRoom } from "./gameRooms.js";
import querystring from "node:querystring"
import qs from 'qs';
import axios from 'axios';
import data from '../certs/secrets.json' assert { type: "json" };

const client_id = data.clientid
const client_secret = data.clientsecret
const redirect_uri = process.env.redirect_uri || "http://localhost:80/api/cb";

//nrp is redis connection
function GetApiRoutes(roomsRef, io){

    let routes = new Router();

    routes.get('/ping', (req, res) => {
        //todo reserve this to serve the static files
        res.send('Oh ITS ABOUT TO BE A POP OFF 🐦');
    });


    routes.get('/api/presentermode', (req, res)=>{
        const state = makeid(16)
        const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing';

        res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
    })

    routes.get('/api/cb', function(req, res) {
        var code = req.query.code || null;
        var state = req.query.state || null;
    
        if (state === null) {
        res.redirect('/#' +
            querystring.stringify({
            error: 'state_mismatch'
            }));
        } else {
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            data: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
            },
            headers: {
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        axios({
            url : authOptions.url,
            method: 'POST',
            headers: {  'content-type': 'application/x-www-form-urlencoded' ,
                        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            data: qs.stringify(authOptions.data),
        }).then(response =>{
            //console.log(response)
            const tokenSet = response.data;
            console.log(tokenSet)
            //submit this token back to the backend server through the redis connection to create the room 
            const roomid = createARoom(roomsRef, tokenSet, "NOTYETASSIGNEDROOM", io)
            //res.send({roomid})
            //todo update this to correct domain
            const baseurl = process.env.domain || "http://localhost:4200"
            res.redirect(baseurl+"/presenter?roomid="+roomid);
        }).catch(err =>{
            console.error(err)
            res.status(500)
            res.send({
                err : "error in setting up room. Check logs in middleware"
            })
        })
        }
    });

  return routes
}

export {GetApiRoutes}

function createARoom(roomsRef, presenterTokenSet, presenterId, io){
    console.log("createRoom", presenterTokenSet);
    
        let unique = false;
        let roomid = "";
        // 🤡 MAKE SURE THIS DOESNT LOCK THE EVENT LOOP YOU DUMBASS!!!!! 🤡
        while(!unique){
            roomid = makeid(5);
            //check to see if roomcode exist
            if(!roomsRef[roomid]){
                //attach socket to the room 
                unique = true;
                let rf = roomsRef
                roomsRef[roomid] = new GameRoom(roomid, presenterId, io,()=>{
                    delete rf[roomid]
                },
                presenterTokenSet
                );
            }
        }

        return roomid;
}