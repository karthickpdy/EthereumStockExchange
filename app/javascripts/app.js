// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import stock_exchange_artifacts from '../../build/contracts/StockExchange.json'


var StockExchange = contract(stock_exchange_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the StockExchange abstraction for Use.
    StockExchange.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
      self.listenEvents();
    });
  },

  listenEvents: function(){
    var self = this;
    StockExchange.deployed().then(function(instance) {
      instance.Transaction({user: account},{fromBlock: "latest", toBlock: 'latest'}).watch(function(err,result){
        self.setStatus(result.args._type+" - "+ result.args.user);
      });
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var meta;
    StockExchange.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
      return meta.getHoldings.call({from:account});
    }).then(function(value){
      var balance_element = document.getElementById("holdingBalance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });



    web3.eth.getBalance(account,function(error,etherBalance) { 
      var balance_element = document.getElementById("etherBalance");
      balance_element.innerHTML = web3.fromWei(etherBalance,"ether").toNumber();      
    })  

  },

  buy: function() {
    var self = this;

    var meta;
    StockExchange.deployed().then(function(instance) {
      meta = instance;
      return meta.buy({from: account,value: web3.toWei(1, "ether")});
    }).then(function() {      
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  sell: function() {
    var self = this;

    var meta;
    StockExchange.deployed().then(function(instance) {
      meta = instance;
      return meta.sell({from: account});
    }).then(function() {      
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {    
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {  
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
