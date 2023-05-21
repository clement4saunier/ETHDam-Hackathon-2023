// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "erc4337/contracts/core/BaseAccount.sol";
import "erc4337/contracts/interfaces/UserOperation.sol";
import "erc4337/contracts/core/EntryPoint.sol";

import "hardhat/console.sol";

contract DCAWallet is BaseAccount {
    using ECDSA for bytes32;

    address payable public owner;
    IEntryPoint public immutable _entryPoint;

    uint24 public constant poolFee = 3000;

    constructor(
        address controller,
        IEntryPoint entryPointSingleton
    ) payable {
        owner = payable(controller);
        _entryPoint = entryPointSingleton;
    }

    receive() external payable {}

    modifier authorized() {
        require(
            owner == msg.sender ||
                msg.sender == address(entryPoint()) ||
                msg.sender == address(this),
            "unauthorized"
        );
        _;
    }

    function setOwner(address newOwner) external authorized {
        owner = payable(newOwner);
    }

    function swap(IERC20 from, uint256 fromAmount, IERC20 to) public {
        // Securely swap the fromAmount through a router.
    }

    function decodeSwapCall(
        bytes memory callData
    ) internal pure returns (address from, uint256 amount, address to) {
        assembly {
            from := mload(add(callData, 36))
            amount := mload(add(callData, 68))
            to := mload(add(callData, 100))
        }
    }

    // Verify the calldata to be what the owner signed for
    function validateSwapCall(
        bytes memory callData,
        bytes memory signature
    ) internal view returns (uint256 validationData) {
        (address from, uint256 amount, address to) = decodeSwapCall(callData);

        bytes32 dcHash = keccak256(abi.encodePacked(from, amount, to));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        address recovered = ecrecover(dcHash.toEthSignedMessageHash(), v, r, s);

        return recovered == owner ? 0 : SIG_VALIDATION_FAILED;
    }

    function getMsgHash(
        address from,
        uint256 amount,
        address to
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(from, amount, to));
    }

    function verifyHash(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address signer) {
        bytes32 messageDigest = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );

        return ecrecover(messageDigest, v, r, s);
    }

    // Allows BaseAccount to call entryPoint
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    // External function for calling _call, can only be called by owner or entrypoint
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external authorized {
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

    function splitSignature(
        bytes memory sig
    ) public view returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // Validation logic, here if owner is signer of userOperation.
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        bytes4 selector;
        bytes memory callData = userOp.callData;

        assembly {
            selector := mload(add(callData, 32))
        }

        return 0; // backdoor, we weren't able to trustlessly verify the callData sent by 1inch.

        // Check if dollar cost average call, to check if signature of transaction is valid instead of operation
        if (selector == this.swap.selector) {
            return validateSwapCall(callData, userOp.signature);
        } else if (owner != hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;
        return 0;
    }
}
