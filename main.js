import io from 'socket.io-client'

const socket = io('http://localhost:3000')
console.log("connection : "+ socket.connected)

const servers = {
    iceServers:[
        {
                urls:['stun:stun1.1.google.com:19302','stun:stun1.1.google.com:19302'],
        },
    ],
    iceCandidatePoolSize:10,
};


const peerConn = new RTCPeerConnection(servers);
const localvideo = document.getElementById("localVideo");
const remotevideo = document.getElementById("remoteVideo");
const startbtn = document.getElementById('start')
const rec = document.getElementById('rec')

/////// on click events //////////
peerConn.ontrack = e=>{

    remotevideo.srcObject = e.streams[0]
    // e.streams[0].getTracks.forEach(t=>{remotevideo.addTrack(t)});
    console.log(peerConn.getTracks)
    console.log("ontrack event : ")
    console.log(e)
    
}

rec.onclick=function(e){
    
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    })
    .then(handleSuccess)
    .then(console.log(peerConn.getTracks))
    .catch(handleError)

    console.log("Tracks : "+peerConn.getTracks)
}

startbtn.addEventListener('click', start);

        


//////////////////////////////////// signaling/////////////



////        ////   handle incoming  offer///////
socket.on('offer', function (offer) {
    console.log(' received offer ::')
    console.log(offer)

    peerConn.setRemoteDescription(offer).then(console.log("offer set !!!")).catch(handleError)

    peerConn.createAnswer()
        .then(answer => { peerConn.setLocalDescription(answer).then(function (a) {
            socket.emit('answer', peerConn.localDescription)
            console.log(peerConn.localDescription)    

        })
         })
        .catch(handleError)

})

/////           handle incoming  Answerr///////

socket.on('answer', function (answer) {
    console.log("answer received")
    peerConn.setRemoteDescription(answer)
            .then(()=>{
                console.log('answer set !!!');
                console.log(peerConn.remoteDescription);    
            }
    ).catch(handleError)

})

//            handle ice addition////

socket.on('ice',function(i){
    console.log( 'ice added  !!!')
    peerConn.setRemoteDescription(i)
})

socket.on('mess',function(s){
    console.log(s)
})




/////// functions


function handleSuccess(stream) {
    localvideo.srcObject = stream;
    
    stream.getTracks().forEach((track) => {
        peerConn.addTrack(track, stream)
    });
}


function hA(answer) {

    console.log('answer received')
    console.log(answer)
    peerConn.setRemoteDescription(answer);

}


function handleError(error) {
    if (error.name === 'NotAllowedError') {
        console.log("PERERERSDFSADF DEFFCFSFs")
    }
    console.error('Error accessing media devices:', error);
    console.log(error.name)
}

function start() { //console.log(peerConn)
    createOffer();
}
function createOffer() {

    peerConn.onicecandidate = (e) => {
        if (e.candidate) {
    
            console.log(" ice candidate reprinting :: ${'peerConn.localDescription'}")
            console.log(peerConn.localDescription)
    
            socket.emit('ice', peerConn.localDescription)
            console.log("connection : "+socket.disconnected)
            
        }

    }


    peerConn.createOffer()
    .then(offer => { peerConn.setLocalDescription(offer)
        .then(function () {
            const offer = peerConn.localDescription 
            console.log(offer) 
            socket.emit('offer',offer)
        }).catch(handleError) 
    })
    .catch(handleError);
    console.log("connection : "+socket.disconnected)

}
