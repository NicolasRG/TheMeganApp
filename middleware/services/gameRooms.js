import {Backend} from "./backend.js";


class GameRoom{

    roomid = "";//string of the roomid
    players = {};//map of the jwt and socketid,  key is socketId
    deleteCb = function(){};
    state = "";
    playlist = "";
    io;//server connection to emit of off
    presenter = "";
    playerCount = 0;

    //needs some obj/connection to the backend server, should be a redis queue message system, bidirectinal
    backend;

    //the presenter will register this so dont emit a call back till its all ready
    constructor(roomid, playerSocketId,  io, deleteCb, presenterTokenSet){
        console.log("creating room")
        this.roomid = roomid;
        this.deleteCb = deleteCb;
        this.io = io;
        this.state = "CREATING"
        this.backend = new Backend(roomid, playerSocketId,presenterTokenSet, this.backendCallback, this);
    }

    addPlayer(playerSocketId, jwt){
        console.log("adding player", jwt)
        //assign avi
        jwt.avatar = this.playerCount;
        this.playerCount++;
        this.players[playerSocketId] = jwt;
        this.io.sockets.sockets.get(playerSocketId).join(jwt.roomCode)
        this.emitSuccessfullyAddedPlayer(jwt, playerSocketId)
    }

    registerPresenter(playerSocketId, jwt){
        this.presenter = playerSocketId
        this.io.sockets.sockets.get(playerSocketId).join(jwt.roomCode)
        this.io.in(this.roomid).emit("newUserInRoom", {players : Object.values(this.players)})
    }
    
    emitSuccessfullyCreatedRoom(){
        this.io.sockets.sockets.get(this.presenter).emit("createdRoom", {token : {roomid : this.roomid}});
    }

    emitSuccessfullyAddedPlayer(jwt, playerSocketId){
        //update this to correct emit message key, value
        this.io.sockets.sockets.get(playerSocketId).emit("checkedIn", {token : {...jwt, roomid : this.roomid}});
        this.io.in(this.roomid).emit("newUserInRoom", {players : Object.values(this.players)})
    }

    removePlayer(playerSocketId){
        delete this.players[playerSocketId]
        this.shouldDeleteRoom()
    }

    //not sure if this will be needed :/
    emitSuccessfullyRemovedPlayer(){
        this.io.in(this.roomid).emit("newUserInRoom", {players : Object.values(this.players)})
    }

    shouldDeleteRoom(){
        if (Object.keys(this.players).length == 0){
            this.deleteCb();
        }
    }

    deleteRoom(){
        this.backend.close();
        //force all remaing clients outttt!!!!
        this.io.sockets.clients(this.roomid).forEach(function(s){
            s.leave(someRoom);
        });
    }

    startGame(socketId){
        //emit some message to the backend server to start the game
        if(socketId == this.presenter){
            this.backend.startGame()
        }else{
            console.error(`present did not initiate start : ${socketId}. New Phone, Who dis??????`)
        }
    }   

    emitNextQuestion(){
        //emit message to all the sockets in the room that new song is plauing(including presenter)
        this.io.in(this.roomid).emit("startedRound", {})
    }

    emitSubmitAnswer(jwt){
        //emit to the backend that a player made answer
        if(this.state == "INSONG"){
            this.backend.submitAnswer(jwt)
        }else{
            console.log("WTF happened to cause this. User tried to submit answer while not ina stage to be allowed to???")
        }
        
    }

    emitCorrectAnswer(msg){
        //TODO make this more efficient look up player and get socketid
        let playerSocketId = ""
        Object.keys(this.players).forEach((socketId)=>{
          if (this.players[socketId].userName == msg.userName){
            playerSocketId = socketId
          }
        })
        this.players[playerSocketId].score = msg.score
        //emit to frontend that a player/socket made a correct answer to both that player and presenter
        this.io.sockets.sockets.get(playerSocketId).emit("correctAnswer", msg);
        this.io.sockets.sockets.get(this.presenter).emit("correctAnswer",  msg);
    }

    emitIncorrectAnswer(msg){
        //emit to frontend that a player/socket made a incorrect answer
         //TODO make this more efficient look up player and get socketid
         let playerSocketId = ""
         Object.keys(this.players).forEach((socketId)=>{
           if (this.players[socketId].userName == msg.userName){
             playerSocketId = socketId
           }
         })
         //emit to frontend that a player/socket made a correct answer to both that player and presenter
         this.io.sockets.sockets.get(playerSocketId).emit("incorrectAnswer", {token : msg});
         this.io.sockets.sockets.get(this.presenter).emit("incorrectAnswer", {token : {userName : msg.userName}});
    }

    emitEndOfRound(msg){
        //emit to the frontend that the round ended, correct answer(song data), and scores
        this.io.in(this.roomid).emit("endRound", { 
            correctAnswer : msg,
            players : Object.values(this.players)
        })
    }


    backendCallback(eventObj, ref){
        const event = eventObj.action; 
        console.debug("got event object", eventObj)
        switch(event){
            case "createdRoom" : 
                console.log("createdRoom received, set room to ready and open");
                ref.state = "OPEN"
                break;
            case "startedRound":
                console.log("new song playing, new round started");
                ref.state = "INSONG"
                ref.emitNextQuestion()
                break;
            case "endRound":
                console.log("song ended scores up on a tuesday");
                ref.state = "AFTERSONG"
                ref.emitEndOfRound(eventObj)
                break;
            case "correctAnswer":
                console.log("user got the song correct, THE SERVER SHOULD HAVE UPDATE THE VALUE IF IT DIDNT I GOING TO NECK MYSELF");
                ref.emitCorrectAnswer(eventObj)
                break;
            case "incorrectAnswer":
                console.log("user got the song incorrect, TELL THEM NECK THEMSELVES");
                ref.emitIncorrectAnswer(eventObj)
                break
            case "disconnect":
                console.log("backend initiated end game. Server crashed !!!");
                //todo handle closing down
                ref.deleteRoom()
                break
            default:
                console.error(`😔 litterally no idea what happened, got this event 😔 ${eventObj}`)
        }
    }

}

export {GameRoom}