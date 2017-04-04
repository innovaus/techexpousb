var appRouter = function(app) {

  var https = require('https');

  // response JSON
  var accountResponse = {
    "accounts": [
      {
        "accounttype": "checking",
        "accountNumber": "7174",
        "balance": "727.41",
        "option": "a",
        "action": [
          "Get Balance",
          "Get Transaction"
        ],
        "transaction": []
      },
      {
        "accounttype": "checking",
        "accountNumber": "5901",
        "balance": "0.25",
        "option": "b",
        "action": [
          "Get Balance",
          "Get Transaction"
        ],
        "transaction": []
      },
      {
        "accounttype": "savings",
        "accountNumber": "3813",
        "balance": "1,017.17",
        "option": "",
        "action": [
          "Get Balance",
          "Get Transaction"
        ],
        "transaction": []
      },
      {
        "accounttype": "credit card",
        "accountNumber": "4571",
        "balance": "36,043.42",
        "credit": "10,956.58",
        "due": "2,500.32",
        "option": "a",
        "action": [
          "Get Balance",
          "Get Transaction",
          "Get Due"
        ],
        "transaction": []
      },
      {
        "accounttype": "credit card",
        "accountNumber": "7352",
        "balance": "6,676.44",
        "credit": "18,323.56",
        "due": "89.23",
        "option": "b",
        "action": [
          "Get Balance",
          "Get Transaction",
          "Get Due"
        ],
        "transaction": []
      }
    ]
  };
  function uniq_fast(a) {
      var seen = {};
      var out = [];
      var len = a.length;
      var j = 0;
      for(var i = 0; i < len; i++) {
           var item = a[i];
           if(seen[item] !== 1) {
                 seen[item] = 1;
                 out[j++] = item;
           }
      }
      return out;
  }
  function account_count(type){
    var count = 0;
    for(var i=0;i<accountResponse.accounts.length;i++){
      if(accountResponse.accounts[i].accounttype == type){
        count++;
      }
    }
    return count;
  }

  app.get("/", function(req, res) {
      res.send("Hello World");
  });

  app.post("/usbservice", function(req, res) {
    //const util = require('util');
    //console.log(util.inspect(req, false, null));
    // check the intent Name
    var intent = req.body.result.metadata.intentName;

    // handle login
    if(intent == 'login') {
      //console.log("Log in");
      // handleLogin(req, res);
    }
    // handle branch locator intent
    else if(intent == 'BranchLocatorIntent') {
        handleBranchLocator(req, res);
    }
    // handle account-service
    else if(intent == 'GetBalanceIntent'){
        handleAccountBalance(req, res);
    }
    // handle Transaction History
    else if (intent == 'GetTransactionsIntent'){
        handleTransactionHistory(req, res);
    }
    // handle Due Date
    else if (intent == 'GetDueDatesIntent'){
        handleDueDateIntent(req, res);
    }
    // handle Account Type selection
    else if (intent == 'AccountTypeSelectionIntent'){
        handleAccountTypeSelectionIntent(req, res);
    }
    // handle Account selection
    else if (intent == 'AccountSelectionIntent'){
        handleAccountSelection(req, res);
    }
    // handle auto loan
    else if (intent == 'GetAutoLoanRatesIntent'){
        handleAutoLoan(req, res);
    }
    // handle home loan
    else if (intent == 'GetHomeLoanRatesIntent'){
        handleHomeLoan(req, res);
    }
    // handle default intent == 'Default Welcome Intent'
    else {
      handleWelcomeIntent(req, res);
    }
  });

app.post("/branchlocator", function(req, res) {
    handleBranchLocator(req, res);
});
// handle welcome intent
var handleWelcomeIntent = function(req, res) {
  // welcome message strings
  var GOOGLE_WELCOME_MESSAGE;
  var FB_WELCOME_TITLE;
  var FB_WELCOME_SUB_TITLE;
  var FB_WELCOME_BUTTON=[];
  // unique account types
  var accountTypes= [];

  for(var i=0;i<accountResponse.accounts.length;i++){
    accountTypes.push(accountResponse.accounts[i].accounttype);
  }
  accountTypes=uniq_fast(accountTypes);

  GOOGLE_WELCOME_MESSAGE = "<speak>Great! Now you can access your accounts. These are the types of accounts you have with us: "+accountTypes.toString()+", Which one would you like? Or, for more options, say help.</speak>";
  FB_WELCOME_TITLE = "Great! Now you can access your accounts.";
  FB_WELCOME_SUB_TITLE = "These are the types of accounts you have with us. Which one would you like?";

  for(var i=0;i<accountTypes.length;i++){
    var button = {"text": accountTypes[i],"postback": accountTypes[i]};
    FB_WELCOME_BUTTON.push(button);
  }

  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
    var response =
    {
    "speech": "",
    "displayText": "",
    "messages": [
                    {
                      "title": FB_WELCOME_TITLE,
                      "subtitle": FB_WELCOME_SUB_TITLE,
                      "buttons": FB_WELCOME_BUTTON,
                      "type": 1
                    },
                    {
                      "title": "Other Queries",
                      "subtitle": "",
                      "buttons": [
                        {
                          "text": "Help",
                          "postback": "Help"
                        }
                      ],
                      "type": 1
                    }
                  ],
    "contextOut": [],
    "source": "US Bank"
    }
    res.send(response);
  } else {
    var response =
      {
      "speech":GOOGLE_WELCOME_MESSAGE,
      "displayText": "",
      "data": {},
      "contextOut": [],
      "source": "US Bank"
      }
    res.send(response);
  }
}

// Start Handle login
var handleLogin = function(req, res) {
  //console.log(req.body.originalRequest.source);
  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
      var branchResponse =
                {
                "speech": "",
                "displayText": "",
                "messages": [
                    {
                      "title": "If you are an existing client, please login.",
                      "subtitle": "",
                      "buttons": [
                        {
                          "text": "Log In",
                          "type":"account_link",
                          "postback": "https://usblogin.herokuapp.com/login.php"
                        }
                      ],
                      "type": 1
                    }
                  ],

                "contextOut": [],
                "source": "U.S Bank"
                }

      res.send(branchResponse);
      return;
    } else {
      var response =
        {
        "speech": "<speak>If you are an existing client, please login.</speak>",
        "displayText": "",
        "data": {},
        "contextOut": [],
        "source": "US Bank"
        }
      res.send(response);
    }
}
// End Handle Login

// Start handleAccountBalance
var handleAccountBalance = function(req, res) {
  console.log("handleAccountBalance");
  var p_accountType="";
  var c_accountType="";
  var accountType="";
  var letter="";

  //read the parameters
  var parameters = req.body.result.parameters;
  if(parameters!=null){
    p_accountType = parameters.accountType;
  }

  // read the context
  var context =  req.body.result.contexts;
  if(context!=null){
    for(var i=0;i<context.length;i++){
      if(context[i].name == "accounttype"){
        c_accountType = context[i].parameters.accounttype;
      }
      if(context[i].name == "accountletter"){
        letter = context[i].parameters.accountletter;
      }
    }
  }
  console.log(p_accountType);
  console.log(c_accountType);
  // check for account type param
  if(p_accountType == "" && c_accountType == ""){
    getSelectAccountTypeResponse(req, res, "balance");
    return;
  } else if(p_accountType!="" && c_accountType!="" && c_accountType!=p_accountType){
    accountType = p_accountType;
  } else if(p_accountType!="" && c_accountType==""){
    accountType = p_accountType;
  } else {
    accountType = c_accountType;
  }

  console.log(accountType);
  // get balance response
  getBalanceResponse(req, res,accountType,letter);
  return;
}
// End handleAccountBalance

// Start  handleTransactionHistory
var handleTransactionHistory = function(req, res) {
  console.log("handleTransactionHistory");
  var context =  req.body.result.contexts;
  var accountType;
  var letter;
  if(context!=null){
    for(var i=0;i<context.length;i++){
      if(context[i].name == "accounttype"){
        accountType = context[i].parameters.accounttype;
        console.log(accountType);
      }
      if(context[i].name == "accountletter"){
        letter = context[i].parameters.accountletter;
        console.log(letter);
      }
    }
  }
  console.log(accountType);
  if(accountType == ""){
    getSelectAccountTypeResponse(req, res);
    return;
  }

  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
    if (accountType == 'checking'){
       var response =
          {
          "speech": "",
          "displayText": "",
          "messages": [
                          {
                            "title": "Your Transaction History as of" + getDate() + " " +getTime(),
                            "subtitle": "Account No:...xxx3562:",
                            "buttons": [
                              {
                                "text": "-$159.90 on 12/01 Web Author",
                                "postback": "-$159.90 on 12/01 Web Author"
                              },
                              {
                                "text": "-$19.98 on 12/01 Debit Purc",
                                "postback": "-$19.98 on 12/01 Debit Purc"
                              },
                              {
                                "text": "+$856.45 on 12/02 Electronic",
                                "postback": "+$856.45 on 12/02 Electronic"
                              }
                            ],
                            "type": 1
                          }
                        ],
          "contextOut": [],
          "source": "US Bank"
          }
          res.send(response);

    }else if(accountType == 'savings'){
        var response =
            {
            "speech": "",
            "displayText": "",
            "messages": [
                            {
                              "title": "Your Transaction History as of" + getDate() +  " " +getTime(),
                              "subtitle": "Account No:...xxx4321:",
                              "buttons": [
                                {
                                  "text": "-$3459.90 on 12/03 Macys",
                                  "postback": "-$3459.90 on 12/03 Macys"
                                },
                                {
                                  "text": "-$239.98 on 12/05 Sears",
                                  "postback": "-$239.98 on 12/05 Sears"
                                },
                                {
                                  "text": "-$2000.45 on 12/08 Transfer",
                                  "postback": "-$2000.45 on 12/08 Transfer"
                                }
                              ],
                              "type": 1
                            }
                          ],
            "contextOut": [],
            "source": "US Bank"
            }
            res.send(response);
    }
  } else {
    if (accountType == 'checkings'){
      var response =
        {
        "speech": "<speak>Your last transaction as of  <say-as interpret-as=\"date\" format=\"yyyymmdd\" detail=\"2\">" + " " + getDate() +
    "</say-as> <say-as interpret-as=\"time\" format=\"hms12\">"+ getTime() +"</say-as> in Checking account ending with <say-as interpret-as=\"digits\">7174</say-as> is - $159.90 on <say-as interpret-as=\"date\" format=\"dm\" > 2-12 </say-as>  Web Author</speak>",
        "displayText": "",
        "data": {},
        "contextOut": [],
        "source": "US Bank"
        }
      res.send(response);
    }else if(accountType == 'savings'){
      var response =
        {
        "speech":  "<speak>Your last transaction as of <say-as interpret-as=\"date\" format=\"yyyymmdd\" detail=\"2\">" + " " + getDate() +
    "</say-as> <say-as interpret-as=\"time\" format=\"hms12\">"+ getTime() +"</say-as> in Saving account ending with <say-as interpret-as=\"digits\">3813</say-as> is - $45.90 on <say-as interpret-as=\"date\" format=\"dm\" > 3-12 </say-as> Macys</speak>",
        "displayText": "",
        "data": {},
        "contextOut": [],
        "source": "US Bank"
        }
      res.send(response);
    }
  }
}
// End handleTransactionHistory

// start handleDueDateIntent
var handleDueDateIntent =function (req, res) {
  var accountType;
  var letter;

  //read the parameters
  var parameters = req.body.result.parameters;
  if(parameters!=null){
    accountType = parameters.accountType;
    if(accountType!=null && accountType!=""){
        getAccountTypeResponse(req, res,accountType);
        return;
    }
  }

  // read the context
  var context =  req.body.result.contexts;
  if(context!=null){
    for(var i=0;i<context.length;i++){
      if(context[i].name == "accounttype"){
        accountType = context[i].parameters.accounttype;
      }
      if(context[i].name == "accountletter"){
        letter = context[i].parameters.accountletter;
      }
    }
  }

  // check for account type param
  if(accountType == ""){
    getSelectAccountTypeResponse(req, res);
    return;
  }

  // account selection
  var GOOGLE_DUE_DATE_MESSAGE;
  var FB_DUE_DATE_TITLE;
  var FB_DUE_DATE_SUB_TITLE;
  var FB_DUE_DATE_BUTTON=[];

  for(var i=0;i<accountResponse.accounts.length;i++){
    if(accountResponse.accounts[i].accounttype == accountType && accountResponse.accounts[i].option == letter){
      GOOGLE_DUE_DATE_MESSAGE = "<speak>The payment for your credit card account ending in <say-as interpret-as=\"digits\">"+accountResponse.accounts[i].accountNumber+"</say-as> is due <say-as interpret-as=\"date\" format=\"yyyymmdd\" detail=\"2\">"+getDate()+". The minimum payment due is $"+accountResponse.accounts[i].due+". You can make a payment, review transactions, or say help. What would you like to do?</speak>";
      FB_DUE_DATE_TITLE = "The minimum payment due is $"+accountResponse.accounts[i].due+" for your credit card account ending in xxx"+accountResponse.accounts[i].accountNumber;
      FB_DUE_DATE_SUB_TITLE = "What would you like to do?";
      // add actions
      var button = {"text": "Make Payment","postback": "Make Payment"};
      FB_DUE_DATE_BUTTON.push(button);
    }
  }

  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
    var response =
       {
       "speech": "",
       "displayText": "",
       "messages": [
                       {
                         "title": FB_DUE_DATE_TITLE,
                         "subtitle": FB_DUE_DATE_SUB_TITLE,
                         "buttons": FB_DUE_DATE_BUTTON,
                         "type": 1
                       }
                     ],
      "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}},
                     {"name":"accountletter", "lifespan":1, "parameters":{"accountletter":letter}}
                   ],
       "source": "US Bank"
       }
       res.send(response);
  } else {
    var response =
      {
      "speech": GOOGLE_DUE_DATE_MESSAGE,
      "displayText": "",
      "data": {},
      "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}},
                      {"name":"accountletter", "lifespan":1, "parameters":{"accountletter":letter}}
                    ],
      "source": "US Bank"
      }
    res.send(response);
  }
}
// end handleDueDateIntent

// Start  handleAccountTypeSelectionIntent
var handleAccountTypeSelectionIntent = function(req, res) {
  console.log(req.body.result.parameters.accountType);
  var accountType = req.body.result.parameters.accountType;
  getAccountTypeResponse(req, res,accountType);
}
// End handleAccountTypeSelectionIntent

// Start  handleAccountSelection
var handleAccountSelection = function(req, res) {
  var letter = req.body.result.parameters.accountletter;
  var context =  req.body.result.contexts;
  var accountType;
  if(context!=null){
    for(var i=0;i<context.length;i++){
      if(context[i].name == "accounttype"){
        accountType = context[i].parameters.accounttype;
      }
    }
  }
  console.log(accountType);
  getAccountSelectResponse(req, res, accountType, letter);
}
// End handleAccountSelection

var getBalanceResponse =function (req, res,accountType,letter) {

  // account balance
  var GOOGLE_ACC_BAL_MESSAGE;
  var FB_ACC_BAL_TITLE;
  var FB_ACC_BAL_SUB_TITLE;
  var FB_ACC_BAL_BUTTON=[];

  for(var i=0;i<accountResponse.accounts.length;i++){
    if(accountResponse.accounts[i].accounttype == accountType && accountResponse.accounts[i].option == letter){
      //check for credit card
      if(accountType != 'credit card'){
        GOOGLE_ACC_BAL_MESSAGE = "<speak>The available balance for your "+accountType+" account ending in <say-as interpret-as=\"digits\">"+accountResponse.accounts[i].accountNumber+"</say-as> is $"+accountResponse.accounts[i].balance+". Next, you can review recent transactions, or start over. What would you like to do next?</speak>";
        FB_ACC_BAL_TITLE = "The available balance is $"+accountResponse.accounts[i].balance+" for your "+accountType+" account ending in xxx"+accountResponse.accounts[i].accountNumber+".";
        FB_ACC_BAL_SUB_TITLE = "What would you like to do next?";
      } else {
        GOOGLE_ACC_BAL_MESSAGE = "<speak>The current balance for your credit card account ending in <say-as interpret-as=\"digits\">"+accountResponse.accounts[i].accountNumber+"</say-as> is $"+accountResponse.accounts[i].balance+", and you have $"+accountResponse.accounts[i].credit+" of available credit. This balance does not reflect pending transactions. Now, you can review transactions or get due dates for your next payment. What would you like to do next?</speak>";
        FB_ACC_BAL_TITLE = "The current balance is $"+accountResponse.accounts[i].balance+" for your credit card account ending in xxx"+accountResponse.accounts[i].accountNumber+".";
        FB_ACC_BAL_SUB_TITLE = "What would you like to do next?";
      }

      // add actions
      for(var j=0;j<accountResponse.accounts[i].action.length;j++){
        var button = {"text": accountResponse.accounts[i].action[j],"postback": accountResponse.accounts[i].action[j]};
        FB_ACC_BAL_BUTTON.push(button);
      }
    }
  }

  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
    var response =
    {
    "speech": "",
    "displayText": "",
    "messages": [
                    {
                      "title": FB_ACC_BAL_TITLE,
                      "subtitle": FB_ACC_BAL_SUB_TITLE,
                      "buttons": FB_ACC_BAL_BUTTON,
                      "type": 1
                    }
                  ],
                  "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}},
                                  {"name":"accountletter", "lifespan":1, "parameters":{"accountletter":letter}}
                                ],
    "source": "US Bank"
    }
    res.send(response);
  } else {
    var response =
      {
      "speech": GOOGLE_ACC_BAL_MESSAGE,
      "displayText": "",
      "data": {},
      "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}},
                      {"name":"accountletter", "lifespan":1, "parameters":{"accountletter":letter}}
                    ],
      "source": "US Bank"
      }
    res.send(response);
  }
}

var getAccountSelectResponse =function (req, res, accountType, letter) {
  // account selection
  var GOOGLE_ACC_SELECT_MESSAGE;
  var FB_ACC_SELECT_TITLE;
  var FB_ACC_SELECT_SUB_TITLE;
  var FB_ACC_SELECT_BUTTON=[];

  for(var i=0;i<accountResponse.accounts.length;i++){
    if(accountResponse.accounts[i].accounttype == accountType && accountResponse.accounts[i].option == letter){
      GOOGLE_ACC_SELECT_MESSAGE = "<speak>Great. For your "+accountType+" account ending in <say-as interpret-as=\"digits\">"+accountResponse.accounts[i].accountNumber+"</say-as>, you can say "+accountResponse.accounts[i].action.toString()+". What would you like to do?</speak>";
      FB_ACC_SELECT_TITLE = "For your "+accountType+" account ending in xxx"+accountResponse.accounts[i].accountNumber;
      FB_ACC_SELECT_SUB_TITLE = "What would you like to do?";
      // add actions
      for(var j=0;j<accountResponse.accounts[i].action.length;j++){
        var button = {"text": accountResponse.accounts[i].action[j],"postback": accountResponse.accounts[i].action[j]};
        FB_ACC_SELECT_BUTTON.push(button);
      }
    }
  }

  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
    var response =
       {
       "speech": "",
       "displayText": "",
       "messages": [
                       {
                         "title": FB_ACC_SELECT_TITLE,
                         "subtitle": FB_ACC_SELECT_SUB_TITLE,
                         "buttons": FB_ACC_SELECT_BUTTON,
                         "type": 1
                       }
                     ],
      "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}},
                     {"name":"accountletter", "lifespan":1, "parameters":{"accountletter":letter}}
                   ],
       "source": "US Bank"
       }
       res.send(response);
  } else {
    var response =
      {
      "speech": GOOGLE_ACC_SELECT_MESSAGE,
      "displayText": "",
      "data": {},
      "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}},
                      {"name":"accountletter", "lifespan":1, "parameters":{"accountletter":letter}}
                    ],
      "source": "US Bank"
      }
    res.send(response);
  }
}

var getAccountTypeResponse =function (req, res,accountType) {

  // account type selection
  var GOOGLE_ACC_TYPE_MESSAGE;
  var FB_ACC_TYPE_TITLE;
  var FB_ACC_TYPE_SUB_TITLE;
  var FB_ACC_TYPE_BUTTON=[];

  var count = account_count(accountType);

  if(count == 1){
    for(var i=0;i<accountResponse.accounts.length;i++){
      if(accountResponse.accounts[i].accounttype == accountType){
        GOOGLE_ACC_TYPE_MESSAGE = "<speak>Great. For your "+accountType+" account ending in <say-as interpret-as=\"digits\">"+accountResponse.accounts[i].accountNumber+"</say-as>, you can say "+accountResponse.accounts[i].action.toString()+". What would you like to do?</speak>";
        FB_ACC_TYPE_TITLE = "For your "+accountType+" account ending in xxx"+accountResponse.accounts[i].accountNumber;
        FB_ACC_TYPE_SUB_TITLE = "What would you like to do?";
        // add actions
        for(var j=0;j<accountResponse.accounts[i].action.length;j++){
          var button = {"text": accountResponse.accounts[i].action[j],"postback": accountResponse.accounts[i].action[j]};
          FB_ACC_TYPE_BUTTON.push(button);
        }
      }
    }
  } else if(count > 1){
    GOOGLE_ACC_TYPE_MESSAGE = "<speak>You have "+count+" "+accountType+" accounts:";
    FB_ACC_TYPE_TITLE = "You have "+count+" "+accountType+" accounts";
    FB_ACC_TYPE_SUB_TITLE = "What would you like to do?";

    for(var i=0;i<accountResponse.accounts.length;i++){
      if(accountResponse.accounts[i].accounttype == accountType){
        GOOGLE_ACC_TYPE_MESSAGE = GOOGLE_ACC_TYPE_MESSAGE +" "+accountResponse.accounts[i].option+" account ending with <say-as interpret-as=\"digits\">"+accountResponse.accounts[i].accountNumber+"</say-as>.";
        var button = {"text": "xxx"+accountResponse.accounts[i].accountNumber+" "+accountType,"postback": accountResponse.accounts[i].option};
        FB_ACC_TYPE_BUTTON.push(button);
      }
    }
    GOOGLE_ACC_TYPE_MESSAGE = GOOGLE_ACC_TYPE_MESSAGE + "Say the letter or the last 4 digits of the account you would like. Which account would you like?</speak>";
  }

  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
    var response =
       {
       "speech": "",
       "displayText": "",
       "messages": [
                       {
                         "title": FB_ACC_TYPE_TITLE,
                         "subtitle": FB_ACC_TYPE_SUB_TITLE,
                         "buttons": FB_ACC_TYPE_BUTTON,
                         "type": 1
                       }
                     ],
       "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}}],
       "source": "US Bank"
       }
       res.send(response);
  } else {
    var response =
      {
      "speech": GOOGLE_ACC_TYPE_MESSAGE,
      "displayText": "",
      "data": {},
      "contextOut": [{"name":"accounttype", "lifespan":1, "parameters":{"accounttype":accountType}}],
      "source": "US Bank"
      }
    res.send(response);
  }
}

var getSelectAccountTypeResponse =function (req, res, action) {
  // welcome message strings
  var GOOGLE_WELCOME_MESSAGE;
  var FB_WELCOME_TITLE;
  var FB_WELCOME_SUB_TITLE;
  var FB_WELCOME_BUTTON=[];
  // unique account types
  var accountTypes= [];

  for(var i=0;i<accountResponse.accounts.length;i++){
    accountTypes.push(accountResponse.accounts[i].accounttype);
  }
  accountTypes=uniq_fast(accountTypes);

  GOOGLE_WELCOME_MESSAGE = "<speak>These are the types of accounts you have with us: "+accountTypes.toString()+", Which one would you like? Or, for more options, say help.</speak>";
  FB_WELCOME_TITLE = "These are the types of accounts you have with us.";
  FB_WELCOME_SUB_TITLE = "Which one would you like?";

  for(var i=0;i<accountTypes.length;i++){
    var button = {"text": accountTypes[i],"postback": accountTypes[i]};
    FB_WELCOME_BUTTON.push(button);
  }

  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
    var response =
    {
    "speech": "",
    "displayText": "",
    "messages": [
                    {
                      "title": FB_WELCOME_TITLE,
                      "subtitle": FB_WELCOME_SUB_TITLE,
                      "buttons": FB_WELCOME_BUTTON,
                      "type": 1
                    },
                    {
                      "title": "Other Queries",
                      "subtitle": "",
                      "buttons": [
                        {
                          "text": "Help",
                          "postback": "Help"
                        }
                      ],
                      "type": 1
                    }
                  ],
    "contextOut": [{"name":"actiontype", "lifespan":1, "parameters":{"action":action}}],
    "source": "US Bank"
    }
    res.send(response);
  } else {
    var response =
      {
      "speech":GOOGLE_WELCOME_MESSAGE,
      "displayText": "",
      "data": {},
      "contextOut": [],
      "source": "US Bank"
      }
    res.send(response);
  }
}

// Start Handle Branch Locator
var handleBranchLocator = function(req, res) {
  //console.log(req.body);
    var zip = req.body.result.parameters.zipcode;
    if(zip == null || zip == "" || zip.length < 5 || zip.length > 5){
      var branchResponse =
                {
                "speech": "Please provide a Zipcode",
                "displayText": "",
                "data": {},
                "contextOut": [],
                "source": "U.S Bank"
                }

      res.send(branchResponse);
      return;
    }
    getJsonFromBranchLocator(zip, function(data){
      if(data.GetListATMorBranchReply.BranchList.length == 0)
        {
            spokenMsg = "<speak>The zip code <say-as interpret-as=\"digits\">" + zip +
                "</say-as> does not have any nearby branches.</speak>";
            cardMsg = "The zip code " + zip + " does not have any nearby branches.";

            response.tellWithCard(spokenMsg, "Branch Locator", cardMsg);
            return;
        }

        var branchName = data.GetListATMorBranchReply.BranchList[0].Name.replace("&", "and");
        var distance = data.GetListATMorBranchReply.BranchList[0].Distance + " miles";
        var streetAddress = data.GetListATMorBranchReply.BranchList[0].LocationIdentifier.Address.AddressLine1.replace("&", "and");
        var closingTime = getBranchClosingTimeForToday(data.GetListATMorBranchReply.BranchList[0]);

        spokenMsg = "<speak>The closest Branch to the <say-as interpret-as=\"digits\">" + zip +
                "</say-as> zip code is the " + branchName + " location. It's located " + distance +
                " away at " + streetAddress + ". " +
                "The branch closes this evening at " + closingTime + ".</speak>";

        cardMsg = "The closest Branch to the " + zip + " zip code is the "
                + branchName + " location. It's located " + distance + " away at " + streetAddress + ". " +
                "The branch closes this evening at " + closingTime + ".";


        if(req.body.originalRequest.source!= null && req.body.originalRequest.source == 'facebook'){
          var branchResponse =
                    {
                    "speech": cardMsg,
                    "displayText": cardMsg,
                    "data": {},
                    "contextOut": [],
                    "source": "U.S Bank"
                  };
          res.send(branchResponse);
        } else {
          var branchResponse =
                    {
                    "speech": spokenMsg,
                    "displayText": cardMsg,
                    "data": {},
                    "contextOut": [],
                    "source": "U.S Bank"
                  };
          res.send(branchResponse);
        }

        return;
     });
};
//End
var url = function(zip){
    return "https://publicrestservice.usbank.com/public/ATMBranchLocatorRESTService_V_8_0/GetListATMorBranch/LocationSearch/" +
                    "StringQuery?application=parasoft&transactionid=cb6b8ea5-3331-408c-9ab3-58e18f2e5f95&output=json&searchtype=E&" +
                    "stringquery=" + zip + "&branchfeatures=BOP&maxitems=1&radius=5";
    //return "https://branchservice.herokuapp.com/";
};

var getJsonFromBranchLocator = function (zip, callback){
  var t0 = new Date().getTime();
    https.get(url(zip), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var t1 = new Date().getTime();
      console.log("Call to service took " + (t1 - t0) + " milliseconds.");
      //var result = body;
      var result = JSON.parse(body);
      return callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};

var getBranchClosingTimeForToday = function(branch){

    var d = new Date().getDay();
    var time = "";

    if(d == 0)
        time = branch.OperationalHours.Sunday.ClosingTime;
    else if(d == 1)
        time =  branch.OperationalHours.Monday.ClosingTime;
    else if(d == 2)
        time =  branch.OperationalHours.Tuesday.ClosingTime;
    else if(d == 3)
        time =  branch.OperationalHours.Wednesday.ClosingTime;
    else if(d == 4)
        time =  branch.OperationalHours.Thursday.ClosingTime;
    else if(d == 5)
        time =  branch.OperationalHours.Friday.ClosingTime;
    else if(d == 6)
        time =  branch.OperationalHours.Saturday.ClosingTime;

    var hour = time.substr(0, 2);
    var minutes = time.substr(3, 2);

    if(hour > 12)
        return (hour - 12) + ":" + minutes + " PM";
    if(hour == 12)
        return hour + ":" + minutes + "PM";
    if(hour < 12)
        return hour + ":" + minutes + "AM";
};

var getDate =function () {


    var date = new Date();

   // var hour = date.getHours();
    //hour = (hour < 10 ? "0" : "") + hour;

    //var min  = date.getMinutes();
    //min = (min < 10 ? "0" : "") + min;

    //var sec  = date.getSeconds();
    //sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    var currentDate = year + "-" + month + "-" + day

    return currentDate;

}

var getTime =function () {


    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;


    /*var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;*/

    var currentTime = hour + ":" + min

    return currentTime;

}

var handleAutoLoan =function(req, res) {
  const util = require('util');
  //console.log(util.inspect(req.body, false, null));
  var zip = req.body.result.parameters.zipcode;
  var loantermmonths = req.body.result.parameters.loanterm;
  var loanamount = req.body.result.parameters.loanamount;
  getJsonFromAutoLoan(zip, loanamount, loantermmonths, function(data){
    var interest = data.AutoLoanRates.RateTier[0].Rate;
    //console.log(interest);


    if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
      var autoLoanResponse =
                    {
                    "speech": "",
                    "displayText": "",
                    "messages": [
                        {
                          "title": "Your new auto loan has an interest rate of "+interest+"%.",
                          "subtitle": "For addtional auto loan information choose from the below options.",
                          "buttons": [
                             {
                              "text": "usbank.com",
                              "postback": "https://www.usbank.com/loans-lines/auto-loans/index.aspx"
                            },
                            {
                              "text": "Connect me to an agent",
                              "postback": "Connect Me"
                            }

                          ],
                          "type": 1
                        }
                      ],

                    "contextOut": [],
                    "source": "U.S Bank"
                    }
          res.send(autoLoanResponse);
          return;
      } else {
        var response =
          {
          "speech": "<speak>Your new auto loan has an interest rate of "+interest+"%. Addtional loan options information can be found at usbank.com. </speak>",
          "displayText": "",
          "data": {},
          "contextOut": [],
          "source": "US Bank"
          }
        res.send(response);
      }
 /*   var autoLoanReponse ={
                      "speech": "Your Auto Loan APR is " +interest+ "% for loan amount of $"+loanamount+" for "+loantermmonths+ "months",
                      "displayText": "",
                      "data": {},
                      "contextOut": [],
                      "source": "U.S Bank"
                    };
    res.send(autoLoanReponse);*/
  });
}

var autoLoanurl = function(zip, loanamount, loantermmonths){
    return "https://publicrestservice.usbank.com/public/RatesRestService_V_5_0/GetAutoLoanRates?application=RIB&output=json&zipcode="+zip+"&loanamount="+loanamount+"&loantermmonths="+loantermmonths;
};

var getJsonFromAutoLoan = function (zip, loanamount, loantermmonths, callback){
  var t0 = new Date().getTime();
    https.get(autoLoanurl(zip, loanamount, loantermmonths), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var t1 = new Date().getTime();
      console.log("Call to service took " + (t1 - t0) + " milliseconds.");
      //var result = body;
      var result = JSON.parse(body);
      return callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};

var handleHomeLoan =function(req, res) {
  const util = require('util');
  console.log(util.inspect(req, false, null));
  getJsonFromHomeLoan(function(data){
    var interest = data.MortgageRatesList.MortgageRates[7].RatesDetailList.Rate;
    console.log(interest);
    if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
      var homeLoanResponse =
                    {
                    "speech": "",
                    "displayText": "",
                    "messages": [
                        {
                          "title": "Our popular 30 years Home Loan has an interest rate of "+interest+"%.",
                          "subtitle": "For addtional home loan information choose from the below options.",
                          "buttons": [
                             {
                              "text": "usbank.com",
                              "postback": "https://www.usbank.com/home-loans/mortgage/mortgage-rates.aspx"
                            },
                            {
                              "text": "Connect me to an agent",
                              "postback": "Connect Me"
                            }

                          ],
                          "type": 1
                        }
                      ],

                    "contextOut": [],
                    "source": "U.S Bank"
                    }
          res.send(homeLoanResponse);
          return;
      } else {
        var response =
          {
          "speech": "<speak>Our popular 30 years Home Loan has an interest rate of "+interest+"%. Addtional loan options information can be found at usbank.com. </speak>",
          "displayText": "",
          "data": {},
          "contextOut": [],
          "source": "US Bank"
          }
        res.send(response);
      }
  /*  var homeLoanReponse ={
                      "speech": "Your Home Loan APR is "+interest+"% APR",
                      "displayText": "",
                      "data": {},
                      "contextOut": [],
                      "source": "U.S Bank"
                    };
    res.send(homeLoanReponse);*/
  });
}

var homeLoanurl = function(){
    return "https://publicrestservice.usbank.com/public/RatesRestService_V_5_0/GetMortgageRates?application=RIB&output=json";

};

var getJsonFromHomeLoan = function (callback){
  var t0 = new Date().getTime();
    https.get(homeLoanurl(), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var t1 = new Date().getTime();
      console.log("Call to service took " + (t1 - t0) + " milliseconds.");
      //var result = body;
      var result = JSON.parse(body);
      return callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};

app.post("/branch", function(req, res) {


  if(req.body.originalRequest != null && req.body.originalRequest.source == 'facebook'){
      var homeLoanResponse =
                    {
                    "speech": "",
                    "displayText": "",
                    "messages": [
                        {
                          "title": "Our popular 30 years Home Loan has an interest rate of "+interest+"%.",
                          "subtitle": "Addtional Home Loan options information can be found at usbank.com. I can also connect to youj one of our loan specialists. Do you be interested?",
                          "buttons": [
                            {
                              "text": "Connect Me",
                              "postback": "Connect Me"
                            }

                          ],
                          "type": 1
                        }
                      ],

                    "contextOut": [],
                    "source": "U.S Bank"
                    }
          res.send(homeLoanResponse);
          return;
      } else {
        var response =
          {
          "speech": "<speak>Our popular 30 years loan has an interest rate of "+interest+"%. Addtional loan options information can be found at usbank.com. </speak>",
          "displayText": "",
          "data": {},
          "contextOut": [],
          "source": "US Bank"
          }
        res.send(response);
      }
    /*var branchResponse =
      {
      "speech": "Barack Hussein Obama II is the 44th and current President of the United States.",
      "displayText": "Barack Hussein Obama II is the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ",
      "data": {},
      "contextOut": [],
      "source": "DuckDuckGo"
      }
    res.send(branchResponse);*/
});

app.post("/branchalexa", function(req, res) {
    var zip = 55124;
    if(zip == null || zip == "" || zip.length < 5 || zip.length > 5){
      var branchResponse =
                {
               "version": "1.0",
      "response": {
          "outputSpeech": {
          "type": "PlainText",
          "text": "Please provide zipcode."
          },
          "card": {
               "content": "",
              "title": "",
           "type": "Simple"
          },
  "shouldEndSession": true
},
"sessionAttributes": {}
                }

      res.send(branchResponse);
      return;
    }
    getJsonFromBranchLocator(zip, function(data){
      if(data.GetListATMorBranchReply.BranchList.length == 0)
        {
            spokenMsg = "<speak>The zip code <say-as interpret-as=\"digits\">" + zip +
                "</say-as> does not have any nearby branches.</speak>";
            cardMsg = "The zip code " + zip + " does not have any nearby branches.";

            response.tellWithCard(spokenMsg, "Branch Locator", cardMsg);
            return;
        }

        var branchName = data.GetListATMorBranchReply.BranchList[0].Name.replace("&", "and");
        var distance = data.GetListATMorBranchReply.BranchList[0].Distance + " miles";
        var streetAddress = data.GetListATMorBranchReply.BranchList[0].LocationIdentifier.Address.AddressLine1.replace("&", "and");
        var closingTime = getBranchClosingTimeForToday(data.GetListATMorBranchReply.BranchList[0]);

        spokenMsg = "<speak>The closest Branch to the <say-as interpret-as=\"digits\">" + zip +
                "</say-as> zip code is the " + branchName + " location. It's located " + distance +
                " away at " + streetAddress + ". " +
                "The branch closes this evening at " + closingTime + ".</speak>";

        cardMsg = "The closest Branch to the " + zip + " zip code is the "
                + branchName + " location. It's located " + distance + " away at " + streetAddress + ". " +
                "The branch closes this evening at " + closingTime + ".";

        var branchResponse =
                  {
                 "version": "1.0",
      "response": {
          "outputSpeech": {
          "type": "PlainText",
          "text": spokenMsg
          },
          "card": {
               "content": "",
              "title": "",
           "type": "Simple"
          },
  "shouldEndSession": true
},
"sessionAttributes": {}
                  }

        //response.tellWithCard(spokenMsg, "Branch Locator", cardMsg);
        res.send(branchResponse);
        return;
     });
});


app.post("/autoloanalexa", function(req, res) {
    console.log(req.body);
    // need to check for values in session attributes
    var session = req.body.session;
    var sessionAttributes = session.attributes;

    if(req.body.request.intent.slots.numberslot.value){

      if(!sessionAttributes.zipcode){
        // collect the value
            var zipcode = {"zipcode":req.body.request.intent.slots.numberslot.value};
            var branchResponse =
                      {
                     "version": "1.0",
                      "response": {
                          "outputSpeech": {
                          "type": "PlainText",
                          "text": "Specify the loan amount"
                          },
                          "shouldEndSession": false
                        },
                        "sessionAttributes": zipcode
                      }
            res.send(branchResponse);
            return;
      } else if(!sessionAttributes.amount){
        // collect the value
            var zipcode = sessionAttributes.zipcode;
            var amount = {
              "zipcode": zipcode,
              "amount": req.body.request.intent.slots.numberslot.value
            };
            var branchResponse =
                      {
                     "version": "1.0",
                      "response": {
                          "outputSpeech": {
                          "type": "PlainText",
                          "text": "Specify the loan term in months"
                          },
                          "shouldEndSession": false
                        },
                        "sessionAttributes": amount
                      }
            res.send(branchResponse);
            return;
      } else if(!sessionAttributes.term){
            // collect the value
            var zipcode = sessionAttributes.zipcode;
            var amount = sessionAttributes.amount;
            var term = req.body.request.intent.slots.numberslot.value;
            var branchResponse =
                      {
                     "version": "1.0",
                      "response": {
                          "outputSpeech": {
                          "type": "PlainText",
                          "text": "Auto loan APR is 3% for "+amount+" of loan amount"
                          },
                          "shouldEndSession": true
                        }
                      }
            res.send(branchResponse);
            return;
      }

    }
    var branchResponse =
              {
             "version": "1.0",
              "response": {
                  "outputSpeech": {
                  "type": "PlainText",
                  "text": "Please provide Zipcode"
                  },
                  "shouldEndSession": false
                },
                "sessionAttributes": {}
              }
    res.send(branchResponse);
    return;
  });

  app.get("/account", function(req, res) {
    var accountMock = {
        "username": "nraboy",
        "password": "1234",
        "twitter": "@nraboy"
    }
    if(!req.query.username) {
        return res.send({"status": "error", "message": "missing username"});
    } else if(req.query.username != accountMock.username) {
        return res.send({"status": "error", "message": "wrong username"});
    } else {
        return res.send(accountMock);
    }
});

app.get("/login", function(req, res) {
    //console.log(req.query);
    //res.send("Hello World");
    //https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID#access_token=ACCESS_TOKEN&token_type=bearer&state=STATE_STRING
    res.writeHead(301,{Location: req.query.redirect_uri+"#access_token=1234567890&token_type=bearer&state="+req.query.state});
    res.end();
});

app.get("/p2pqr", function(req, res) {
    //https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID#access_token=ACCESS_TOKEN&token_type=bearer&state=STATE_STRING
    res.writeHead(301,{Location: "usbank://sendmoney?amount="+req.query.amount+"&sender="+req.query.sender+"&token="+req.query.token});
    res.end();
});

}

module.exports = appRouter;
