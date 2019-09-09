const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var testStateSchema = new Schema({
    "tokenId": String,
    "timeLeft": Number,
    "state": [
        {
            "questionNo":String,
            "qType": String,
            "sectionType":String,
            "question": String,
            "input": Array,
            "output": Array,
            "testCasesPasses": String,
            "code": String,
            "answers": Array,
            "userAnswer": String,
            "actualAnswer": String,
            "comments":Array
        }
    ]
});

var testState = mongoose.model('partial_state', testStateSchema);
module.exports = testState;
