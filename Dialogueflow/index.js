// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const axios = require('axios');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
 
  function statusUpdate(agent) {
    const id = agent.parameters.id;
    agent.add(`The status for elevator ${id} is:`);
     return axios.get(`https://re-restapi-fcf.azurewebsites.net/api/Elevator/${id}`)
    .then(result => {
       const TEST1 = result.data.status;
       agent.add(`This elevator is currently ${TEST1}`);
         
     });
   

  }
 
 
  function getBriefHandler(agent){
   
    return axios.all([
        axios.get('https://restapi-codeboxx-fd.azurewebsites.net/api/Elevator'),
        axios.get('https://re-restapi-fcf.azurewebsites.net/api/Elevator/nonoperational'),
        axios.get('https://restapi-codeboxx-fd.azurewebsites.net/api/Battery'),
        axios.get('https://restapi-codeboxx-fd.azurewebsites.net/api/Building'),
        axios.get('https://restapi-codeboxx-fd.azurewebsites.net/api/Customer'),
        axios.get('https://restapi-codeboxx-fd.azurewebsites.net/api/Quote'),
        axios.get('https://restapi-codeboxx-fd.azurewebsites.net/api/Address'),
        axios.get('https://restapi-codeboxx-fd.azurewebsites.net/api/Lead')
 
 
 
    ])
    .then(responseArr => {
        const eleNum = responseArr[0].data.length;
        const inactiveEle = responseArr[1].data.length;
        const batteriesNum = responseArr[2].data.length;
        const buildingsNum = responseArr[3].data.length;
        const customerNum = responseArr[4].data.length;
        const quoteNum = responseArr[5].data.length;
        const cityNum = responseArr[6].data.length;
        const leadNum = responseArr[7].data.length;
 
     
 
 
        console.log('Number of elevators: ', eleNum);
        console.log('Number of in-active elevators: ', inactiveEle);
        console.log('Number of batteries: ', batteriesNum);
        agent.add(`Greetings There are currently ${eleNum} elevators deployed in the ${buildingsNum} buildings of your ${customerNum} customers Currently, ${inactiveEle} elevators are not in Running Status and are being serviced ${inactiveEle} Batteries are deployed across ${cityNum} cities On another note you currently have ${quoteNum} quotes awaiting processing You also have ${leadNum} leads in your contact requests`);
    });
 
  }
 
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('statusUpdate', statusUpdate);
  intentMap.set('getBrief', getBriefHandler);
 
  agent.handleRequest(intentMap);
});