var StockExchange = artifacts.require("./StockExchange.sol");

module.exports = function(deployer) {
  deployer.deploy(StockExchange);
};
