const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
var mongoose = require('mongoose');


const mongoConfig = {
    username: "jitendra_cdk",
    password: "cdk_mock_project",
    dbname: "online_exam_system"
};
const uri = `mongodb+srv://${mongoConfig.username}:${mongoConfig.password}@cdkmockproject-jvgcr.mongodb.net/${mongoConfig.dbname}?retryWrites=true&w=majority`;

const testState = require("./models/userState");
mongoose.Promise = global.Promise;

var exampleState = new testState({
    "tokenId": "CDKTESTF002",
    "timeLeft": 300,
    "state": [
        {
            "questionNo": 1,
            "qtype": "coding",
            "Question": "Write a Hello World Program",
            "input": ["1", "2"],
            "output": ["Hello World\n"],
            "testCasesPasses": "",
            "code": ""
        },
        {
            "questionNo": 2,
            "qtype": "objective",
            "Question": "Today it is Thursday.After 132 days,it will be",
            "Answers": ["Monday", "Sunday", "Wednesday", "Thursday"],
            "userAnswer": "",
            "actualAnswer": "3"
        },
        {
            "questionNo": 3,
            "qtype": "coding",
            "Question": "Write a Program to add two numbers",
            "input": ["5", "6"],
            "output": ["11\n"],
            "testCasesPasses": "",
            "code": ""

        },
        {
            "questionNo": 4,
            "qtype": "subjective",
            "Question": "Where do you see yourself after 5 years?",
            "Answers": "",
            "userAnswer": "",
            "actualAnswer": ""
        }
    ]
});

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(cors());

app.post("/completeTest/:testId", (req, res) => {
    const filter = { "tokenId": req.params.testId };
    const update = { "timeLeft": 0, "state": req.body };
    console.log(req.body.state);
    testState.update(filter, {
        "$set": {
            "timeLeft": 0,
            "state": req.body.state
        }
    }, { upsert: 1 }, (err, querySet) => {
        if (err) {
            res.json({ err: err });
        } else {
            res.json({ message: "success" });
        }
    });
});

//get the list of all the tests
app.get("/getAllTests",(req,res)=>{
    var tokens=[];
    testState.find({},function (err, docs) {
        for(var i=0;i<docs.length;i++){      
            tokens.push(docs[i].tokenId);
        }
        res.status(400);
        res.json({
            list:tokens
        });
    });
});

app.post("/updateState/:testId/:questionNo", (req, res) => {
    //console.log("Question No "+req.params.questionNo,req.params.testId);
    //console.log(req.body.state);
    const filter = { "tokenId": req.params.testId, "state.questionNo": req.body.state.questionNo };
    var questionNo = parseInt(req.params.questionNo);
    var update = {};
    update.timeLeft = req.body.timeLeft;
    //console.log(req.body.state.userAnswer);
    console.log(req.body.state.qType);
    switch (req.body.state.qType) {
        case "coding":
            //console.log("coding question");
            testState.update(filter, {
                "$set": {
                    "timeLeft": req.body.timeLeft,
                    "state.$.code": req.body.state.code,
                }
            }, { upsert: 1 }, (err, querySet) => {
                res.json({ result: querySet });
            });
            break;
        default:
            testState.update(filter, {
                "$set": {
                    "timeLeft": req.body.timeLeft,
                    "state.$.userAnswer": req.body.state.userAnswer
                }
            }, { upsert: 1 }, (err, querySet) => {
                if (err) {
                    res.json({ err: err });
                } else {
                    res.json({ message: "success" });
                }
            });
            break;
    }
});

app.post("/initTest", (req, res) => {
    exampleState = new testState(req.body.state);
    try {
        testState.find({ tokenId: req.body.state.tokenId }, function (err, object) {
            if (object.length) {
                res.json({"already":object});
            } else {
                exampleState.save((err) => {
                    if (err) {
                        res.json({ error: err });
                    } else {
                        res.json({ message: "saved successfully" });
                    }
                });
            }
        });
    } catch (err) {
        res.json({ error: err });
    }

});
app.get("/getTest/:testId", (req, res) => {
    testState.findOne({ 'tokenId': req.params.testId }, function (err, querySet) {
        res.json({ result: querySet });
    });
});
app.get("/", (req, res) => {
    res.status(200);
    res.json({ working: true });
});

mongoose.connect(uri, { useNewUrlParser: true })
    .then(() => {
        console.log('connection succesful');
        app.listen(8900, () => console.log("Application is working fine"));
    })
    .catch((err) => console.error(err));

