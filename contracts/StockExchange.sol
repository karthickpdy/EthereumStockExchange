pragma solidity ^0.4.2;

contract StockExchange {

	mapping (address => uint) balances;
	uint holdings;

	event Transaction(string _type, address indexed user);

	function StockExchange() {
		holdings = 10000;
	}

	function buy() payable{
		if(msg.value == 1 ether){
			balances[msg.sender] += 1;
			holdings -= 1;
			Transaction("Buy",msg.sender);
		}
	}

	function sell(){
		balances[msg.sender] -= 1;
		holdings += 1;
		msg.sender.transfer(1 ether);
		Transaction("Sell",msg.sender);
	}

	function getBalance(address addr) returns(uint) {
		return balances[addr];
	}

	function getHoldings() returns(uint) {
		return holdings;
	}
}