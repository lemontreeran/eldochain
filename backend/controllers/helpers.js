var nlp = require('compromise')
var natural = require('natural');
var thesaurus = require("thesaurus");


exports.helpers = {
    getValues: function (myJson) {
        for (var keyIn in myJson) {
            if (myJson.hasOwnProperty(keyIn + "")) {
                // Check if its an an array then just assign value
                if (Object.prototype.toString.call(myJson[keyIn + ""]) === undefined) {
                    // return JSON.stringify({"END": "IS IS FINISHED"});
                } else {
                    // Call the function recursively
                    if (
                        (keyIn + "").toLowerCase().includes("route") || (keyIn + "").toLowerCase().includes("twilio") || (keyIn + "").toLowerCase().includes("data") || (keyIn + "").toLowerCase().includes("payload")) {
                        return "\n\n" + keyIn + ":\n" + JSON.stringify(myJson[keyIn + ""]) + "\n\n" + getValues(myJson[keyIn + ""]);
                    }
                }
            }
        }
    },
    verbs: function (myText) {
        var r = nlp(myText);
        var verbs = r.verbs();
        return verbs.out('array');
    },
    intent: function (words, intentList) {
        intentList = "read";

        return this.getClosest(words, intentList);
    },
    getClosest(data, baseline) {
        return data.map(function (word) {
          return natural.JaroWinklerDistance(baseline,word);
        });
    },
    cotainsSame: function (haystack, arr) {
        return arr.some(function (v) {
            return haystack.indexOf(v) >= 0;
        });
    },
    jsonFromSMS: function (body) {
        var sms = body.Body;
        var sender = body.From;
        sms = sms.trim().toLowerCase();
        var textParts = sms.split(/\s+/);
        var input = {};
        var msg;

        // TEXT FORMAT
        // TO ASK: what fruits|vegetable|meat are available in saskatoon next week
        // TO ORDER: order fruits|vegetable|meat in saskatoon for next week
        // TO CHECK IF HAVE ACCESS: does userName with contact  <Number/Email> have assetID
        // let verbs = this.verbs(sms.trim());
        // let giveWords  = thesaurus.find("ask");
        // if (this.cotainsSame(verbs,,))
        // if(verbs.indexOf(''))
        switch (textParts[0]) {
            case "what":
                input = {
                    action: "ask",
                    sender: sender,
                    location: nlp(sms).places().out('array')[0] || "",
                    createdOn: this.currentTime(),
                    type: nlp(sms).nouns().out('array')[0] || "",
                    date: nlp(sms).dates().out('array')[0] || ""
                };
                break;
            case "order":
                input = {
                    action: "order",
                    sender: sender,
                    location: nlp(sms).places().out('array')[0] || "",
                    createdOn: this.currentTime(),
                    type: nlp(sms).nouns().out('array')[0] || "",
                    date: nlp(sms).dates().out('array')[0] || ""
                };
                break;
            case "re-order":
                input = {
                    action: "order",
                    sender: sender,
                    location: nlp(sms).places().out('array')[0] || "",
                    createdOn: this.currentTime(),
                    type: nlp(sms).nouns().out('array')[0] || "",
                    date: nlp(sms).dates().out('array')[0] || ""
                };
                break;
            case "yes":
                input = {
                    action: "yes",
                    sender: sender,
                    createdOn: this.currentTime()
                };
                break;
            case "no":
                input = {
                    action: "no",
                    sender: sender,
                    createdOn: this.currentTime()
                };
                break;
            case "reorder":
                input = {
                    action: "order",
                    sender: sender,
                    location: nlp(sms).places().out('array')[0] || "",
                    createdOn: this.currentTime(),
                    type: nlp(sms).nouns().out('array')[0] || "",
                    date: nlp(sms).dates().out('array')[0] || ""
                };
                break;
            default:
                input = {
                    action: "other",
                    sender: sender,
                    msg: sms
                };
        }
        return {
            input: input,
            msg: msg
        };
    },
    currentTime: function () {
        var today = new Date();
        return today.setDate(today.getDate() + 0);
    },
    S4: function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid: function () {
        var num = (this.S4() + this.S4() + "-" + this.S4() + "-4" + this.S4().substr(0, 3) + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4()).toLowerCase() + "";
        return num;
    },
    isJson: function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

};

