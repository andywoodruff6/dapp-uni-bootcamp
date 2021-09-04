// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.0;

contract Token {
    string public name = "My Name";
    string public symbol = "andy";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    constructor() public{ //constructors have to be public
        totalSupply = 6000000* (10 ** decimals);
    }

}

