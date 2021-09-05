// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {
    using SafeMath for uint;

    // Variables
    string public name = "Polar Bear Swap";
    string public symbol = "PBS";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    //Track balances
    mapping(address => uint256) public balanceOf;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value); // indexed allows for listening to a specific address


    constructor() public{ //constructors have to be public
        totalSupply = 6000000* (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }
    //send tokens
    function transfer(address _to, uint256 _value) public returns (bool susccess){
        require(_to != address(0));
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }




}

