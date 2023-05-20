import { defaultAbiCoder } from "@ethersproject/abi";
import { UserOperation } from "erc4337/test/UserOperation";
import { BigNumber, Contract, Signer, Wallet } from "ethers";
import { arrayify, keccak256 } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const DefaultsForUserOp: UserOperation = {
  sender: ethers.constants.AddressZero,
  nonce: 0,
  initCode: "0x",
  callData: "0x",
  callGasLimit: 0,
  verificationGasLimit: 150000, // default verification gas. will add create2 cost (3200+200*length) if initCode exists
  preVerificationGas: 21000, // should also cover calldata cost.
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 1e9,
  paymasterAndData: "0x",
  signature: "0x",
};

export function fillUserOpDefaults(
  op: Partial<UserOperation>,
  defaults = DefaultsForUserOp
): UserOperation {
  const partial: any = { ...op };
  // we want "item:undefined" to be used from defaults, and not override defaults, so we must explicitly
  // remove those so "merge" will succeed.
  for (const key in partial) {
    if (partial[key] == null) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete partial[key];
    }
  }
  const filled = { ...defaults, ...partial };
  return filled;
}

export function packUserOp(op: UserOperation): string {
  return defaultAbiCoder.encode(
    [
      "address",
      "uint256",
      "bytes32",
      "bytes32",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "bytes32",
    ],
    [
      op.sender,
      op.nonce,
      keccak256(op.initCode),
      keccak256(op.callData),
      op.callGasLimit,
      op.verificationGasLimit,
      op.preVerificationGas,
      op.maxFeePerGas,
      op.maxPriorityFeePerGas,
      keccak256(op.paymasterAndData),
    ]
  );
}

export function getUserOpHash(op: UserOperation, entryPoint: string, chainId: number): string {
  const userOpHash = keccak256(packUserOp(op));
  const enc = defaultAbiCoder.encode(
    ["bytes32", "address", "uint256"],
    [userOpHash, entryPoint, chainId]
  );
  return keccak256(enc);
}

export async function fillUserOp(
  op: Partial<UserOperation>,
  signer: Wallet | Signer,
  entryPoint: string
) {
  const userOp = { ...op };

  if (userOp.callData == null || userOp.sender == null)
    throw new Error("Missing essential data for UserOperation filling");

  if (userOp.nonce == null) {
    const smartWallet = new Contract(
      userOp.sender,
      [`function getNonce() view returns(uint256)`],
      ethers.provider
    );

    userOp.nonce = await smartWallet.getNonce();
  }

  if (userOp.callGasLimit == null) {
    const estimatedGas = await ethers.provider.estimateGas({
      from: entryPoint,
      to: userOp.sender,
      data: userOp.callData,
    });

    userOp.callGasLimit = estimatedGas;
  }

  return fillUserOpDefaults(userOp);
}

export async function fillAndSignUserOp(
  op: Partial<UserOperation>,
  signer: Wallet | Signer,
  entryPoint: string
) {
  const userOp: UserOperation = await fillUserOp(op, signer, entryPoint);

  const chainId = await ethers.provider.getNetwork().then(net => net.chainId);
  const message = arrayify(getUserOpHash(userOp, entryPoint, chainId));

  return { ...userOp, signature: await signer.signMessage(message) };
}
