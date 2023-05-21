// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./DCAWallet.sol";

contract WalletFactory  {
    IEntryPoint private entryPoint;

    mapping(address account => address wallet) public walletOf;

    event Created(address indexed wallet, address indexed owner);

    constructor (IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
    }

    function createWallet() external {
        DCAWallet wallet = new DCAWallet(msg.sender, entryPoint);

        walletOf[msg.sender] = address(wallet);
        emit Created(address(wallet), msg.sender);
    }
}
