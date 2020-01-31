/*jslint node: true, sloppy: true, white: true */

/*
 * testEmailValidation.php
 *
 * @(#) $Id: testEmailValidation.js,v 1.4 2014/04/05 12:10:27 mlemos Exp $
 *
 */

function emailValidate(email, cb){
	var  validation, emailValidation;
	console.log(email)
  	let data ={}
	if(email < 3)
	{
		cb('It was not specified the e-mail address for validation.');
	}
	else
	{
		/*
		 * Load the e-mail validation module
		 */
		emailValidation = require('./emailvalidation');
	
		/*
		 * Configure the path of the sockets module
		 */
		emailValidation.socketsModule = './sockets';
	
		var validation = new emailValidation.validation();
		
		/*
		 * E-mail address of local user to simulate e-mail delivery
		 */
		validation.localAddress = 'localuser@localhost';
	
		/*
		 * Output debug information
		 */
		validation.debug = true;
	
		/*
		 * Output debug information about network socket communication
		 */
		validation.debugSockets = false;
	
		/*
		 * Function to output debug information
		 */
		validation.debugOutput = console.log;
	
		/*
		 * Timeout for network socket communication in seconds
		 */
		validation.timeout = 15;
	
		
		validation.emailDomainsWhitelistFile = './data/emaildomainswhitelist.csv';
		validation.invalidEmailUsersFile = './data/invalidemailusers.csv';
		validation.invalidEmailDomainsFile = './data/invalidemaildomains.csv';
		validation.invalidEmailServersFile = './data/invalidemailservers.csv';
		
		validation.validate(email, (result) => {
			console.log(result)
			cb(null, {
				'email': email,
				'status': (result && result.valid) ? true : false
			})	
		});
	}
	/**data['success'] = true
	data['status']=result
	data['email']=email
	return data
	**/
	
} 
function getEmail(task){
	let variables = task.variables
	for(let i=0; i < variables.length; i++){
		if(variables[i].name==='valid_email'){
			return variables[i].value
		}
	}
}

function getData(task){
    let variables = task.variables
    for(let i=0; i < variables.length; i++){
        if(variables[i].name==='profile'){
            return variables[i].value
        }
    }
  }
module.exports = {
	emailValidate,
	getEmail,
	getData
	
}