/* ============ Validate: plain code checks what the model wrote ============
   The rules live in src/chronicle.js, so the game (copy-and-paste flow on the History tab) and this pipeline
   check a chronicle in exactly the same way. Every check returns a readable error that can go back to the model. */
"use strict";
const {validate,parseReply,toStored,namesIn,yearsIn,LIMITS}=require('../../src/chronicle.js');
module.exports={validate,parseReply,toStored,namesIn,yearsIn,LIMITS};
