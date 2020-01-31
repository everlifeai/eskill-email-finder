'use strict'
const cote = require('cote')
const u = require('@elife/utils')
const emailValidation = require('./emailvalidate')


//microservice key (identity of the microservice) /
let msKey = 'eskill_email_finder'

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/j
 * Start our microservice.
 */
function main() {
    startMicroservice()
    registerWithCommMgr()
}

const errmsg = {
    ERR: 'Please enter proper email id.Try again...'
}


const commMgrClient = new cote.Requester({
    name: 'email finder Skill -> CommMgr',
    key: 'everlife-communication-svc',
})


function sendReply(msg, req) {
    req.type = 'reply'
    req.msg = String(msg)
    commMgrClient.send(req, (err) => {
        if (err) {
            u.showErr('eskill_email_finder:')
            u.showErr(err)
        }
    })
}

function registerWithCommMgr() {
    commMgrClient.send({
        type: 'register-msg-handler',
        mskey: msKey,
        mstype: 'msg',
        mshelp: [
            { cmd: '/email_validate', txt: 'For validating an email id' } 
        ],
    }, (err) => {
        if(err) u.showErr(err)
    })
}


    /*      understand/
     * The microservice (partitioned by key to prevent
     * conflicting with other services).
     */
    function startMicroservice() {
    const svc = new cote.Responder({
        name: 'Email finder skill',
        key: msKey,
    })

    svc.on('task', (req, cb) => { 
        
        try{
            
            let profile = JSON.parse(emailValidation.getData(req.task)); 
            let emailList = getEmailList(profile);
            let idx=0;
            
            getValidEmail(emailList,idx,(err, email)=>{
                cb(null, req.task, {email: email})
            })
         
        }catch(e){
            console.log(e)
            cb('Something went wrong')
        }
    })


    function getValidEmail(emailList,idx,cb) {
        if(emailList.length <= idx) cb(null, emailList[0])
        else {
            try{
                emailValidation.emailValidate(emailList[idx],(err, result)=>{
                    if(result.status) {
                        cb(null, email)
                    }else {
                        idx++;
                        getValidEmail(emailList,idx,cb)
                    }
                })
            }catch(e){
                idx++;
                getValidEmail(emailList,idx,cb)
            }
        }
    }

    /**
     * Get different email pattern
     * @param {} profile 
     */
    function getEmailList(profile){
        
        
        var firstname = profile.firstname;
        var lastname = profile.lastname;
        var domain = profile.domain;
        let emailList = []
        
        if (firstname==null || firstname==""){
            
            return emailList;    
        } else if (lastname==null || lastname==""){
            
            return emailList
        } else if (domain==null || domain==""){
            
            return emailList;
        } 
        
        firstname = firstname.toLowerCase()
        lastname = lastname.toLowerCase()
        //bob@domain.com
        emailList.push(firstname + "@" + domain)
        
        //bobsmith@domain.com
        emailList.push(firstname + lastname + "@" + domain)
        
        //bob.smith@domain.com
        emailList.push(firstname + "." + lastname + "@" + domain)
        
        //smith@domain.com
        emailList.push(lastname + "@" + domain)
        
        //bsmith@domain.com
        emailList.push(firstname.charAt(0) + lastname + "@" + domain)
        
        //b.smith@domain.com
        emailList.push(firstname.charAt(0) + "." + lastname + "@" + domain)
        
        //bobs@domain.com
        emailList.push(firstname + lastname.charAt(0) + "@" + domain)
        
        //bob.s@domain.com
        emailList.push(firstname + "." + lastname.charAt(0) + "@" + domain)
        
        //bs@domain.com
        emailList.push(firstname.charAt(0) + lastname.charAt(0) + "@" + domain)
        return emailList;
    }
    
}
   

main() 