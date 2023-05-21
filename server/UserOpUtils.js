const { defaultAbiCoder } = require("@ethersproject/abi");
const { BigNumber, Contract, Signer, Wallet, keccak256, arrayify } = require("ethers");
const ethers = require("ethers");

const DefaultsForUserOp = {
  sender: "0x",
  nonce: 0,
  initCode: "0x",
  callData: "0x",
  callGasLimit: 0,
  verificationGasLimit: 150000, // default verification gas. will add create2 cost (3200+200*length) if initCode exists
  preVerificationGas: 21000, // should also cover calldata cost.
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 1e9,
  paymasterAndData: "0x",
  signature: "0x"
};

function fillUserOpDefaults(op, defaults = DefaultsForUserOp) {
  const partial = { ...op };
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

function packUserOp(op) {
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
      "bytes32"
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
      keccak256(op.paymasterAndData)
    ]
  );
}

function getUserOpHash(op, entryPoint, chainId) {
  const userOpHash = keccak256(packUserOp(op));
  const enc = defaultAbiCoder.encode(
    ["bytes32", "address", "uint256"],
    [userOpHash, entryPoint, chainId]
  );
  return keccak256(enc);
}

async function fillUserOp(op, signer, entryPoint) {
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
      data: userOp.callData
    });

    userOp.callGasLimit = estimatedGas;
  }

  return fillUserOpDefaults(userOp);
}

async function fillAndSignUserOp(op, signer, entryPoint) {
  const userOp = await fillUserOp(op, signer, entryPoint);

  const chainId = await ethers.provider.getNetwork().then(net => net.chainId);
  const message = arrayify(getUserOpHash(userOp, entryPoint, chainId));

  return { ...userOp, signature: await signer.signMessage(message) };
}

module.exports = {
  fillAndSignUserOp
}