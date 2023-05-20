// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract MyContract {
    string public myString = "Hello, world!";

    function setMyString(string memory _myString) public {
        myString = _myString;
    }
}