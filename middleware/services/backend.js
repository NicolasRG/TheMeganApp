import axios from 'axios';
import  NRP from 'node-redis-pubsub';

class Backend{
    //actually might be best to keep the nrp in here as it will do everything
    nrp;
    nrpconsumer;
    queueId = "";
    roomCode = "";
    consumerCb = function(){};
    backendUrl =  process.env.backendurl|| "http://localhost:8000";//idk populate this when you get it
    ref
    

    //presenter just needs to be the socketid of the presenter (for now)
    //todo update the presenter obj for the spotify integrations
    constructor(roomCode, presenter, presenterTokenSet, consumerCb, ref){
        console.log("creating consumer")
        //🏎 THIS WILL A 100% CAUSE RACE CONDITIONS 🏎
        this.setupQueueId(roomCode, presenter, presenterTokenSet);
        //create redis objs
        this.roomCode = roomCode;
      

        const config = {
            port  : 6379  , // Port of your locally running Redis server
            scope : 'middleware'  // Use a scope to prevent two NRPs from sharing messages
          };
          
        this.consumerCb = consumerCb;
        this.ref = ref
    }

    setupQueueId(roomCode, presenter, presenterTokenSet){
        console.log(`calling backend with ${roomCode} + ${presenter}`)

        axios.post(this.backendUrl+"/startgame", 
            { 
              "roomCode" : roomCode,
              "presenter" : presenter,
              presenterTokens : presenterTokenSet
            }
        ).then( (res)=>{
            const data = res.data;
            console.log(data);
            //data should contain queueid
            this.queueId = data.queueId
            this.register(this.queueId);
            //TODO use the consumerCb object to let the gameroom know that the backend is ready

        }).catch(err =>{
            console.error(err)
        })
    }


    //register events to listen to on the consumer
    register(){
       //create the producer here
       let host = process.env.redishost || "localhost"
       let config = {
            host,
            port  : 6379  , // Port of your locally running Redis server
            scope : 'middleware'  // Use a scope to prevent two NRPs from sharing messages
        };
       this.nrp = new NRP(config); // This is the NRP client
       const cb = this.consumerCb;
       const ref = this.ref
       
       //backend 
        config = {
            host,
            port  : 6379  , // Port of your locally running Redis server
            scope : 'backend'  // Use a scope to prevent two NRPs from sharing messages
        };
       this.nrpconsumer = new NRP(config); // This is the NRP client
       this.nrpconsumer.on(this.queueId, function(data){
            console.log('Got msg from backend' + data);
            cb(data, ref)
        });

        //emit success message
       this.nrp.emit(this.queueId , {
            roomCode : this.roomCode,
            action : "initialCheckin",
       })
    }

    startGame(){
        this.nrp.emit(this.queueId , {
            roomCode : this.roomCode,
            action : "startGame",
       })
    }

    submitAnswer(jwt){
        this.nrp.emit(this.queueId , {
            roomCode : this.roomCode,
            action : "submitAnswer",
            answer : jwt.answer,
            userName : jwt.userName,
            score : jwt.score,
            avatar : jwt.avatar
       })
    }

    close(){
        //todo make sure this is all that is needed
        this.nrp.emit(this.queueId , {
            action : "shutDown",
       })
        this.nrp.quit()
        this.nrpconsumer.quit()
    }
}

export {Backend}