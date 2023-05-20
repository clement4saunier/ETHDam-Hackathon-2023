// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "erc4337/contracts/core/BaseAccount.sol";
import "erc4337/contracts/interfaces/UserOperation.sol";
import "erc4337/contracts/core/EntryPoint.sol";

contract DCAWallet is BaseAccount {
    using ECDSA for bytes32;

    address payable public owner;
    IEntryPoint private immutable _entryPoint;

    // Allows BaseAccount to call entryPoint
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    constructor(IEntryPoint entryPointSingleton) payable {
        owner = payable(msg.sender);
        _entryPoint = entryPointSingleton;
    }

    receive() external payable {}

    // External function for calling _call, can only be called by owner or entrypoint
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        require(
            owner == msg.sender || msg.sender == address(entryPoint()),
            "not from entrypoint"
        );

        _call(dest, value, func);
    }

    // Calls transaction from smart wallet.
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    // Validation logic, here if owner is signer of userOperation.
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();

        if (owner == hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;
        return 0;
    }
}
