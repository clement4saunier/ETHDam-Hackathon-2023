import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { fillAndSignUserOp } from "./UserOpUtils";
import { AbiCoder } from "@ethersproject/abi";
import { encode } from "punycode";
import { getContractFactory } from "@nomiclabs/hardhat-ethers/types";

describe("DCAWallet", function () {
  async function deployWalletAndContext() {
    const [owner] = await ethers.getSigners();
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();

    const Wallet = await ethers.getContractFactory("DCAWallet");
    const wallet = await Wallet.deploy(owner.address, entryPoint.address);

    return { wallet, entryPoint };
  }

  describe("Deployment", function () {
    it("Should set the right owner & entrypoint", async function () {
      const [owner] = await ethers.getSigners();
      const { wallet, entryPoint } = await deployWalletAndContext();

      expect(await wallet.owner()).to.equal(owner.address);
      expect(await wallet.entryPoint()).to.equal(entryPoint.address);
    });
  });

  describe("Direct Transactions", function () {
    it("Should be able to execute function from smart wallet directly", async function () {
      const [owner, newOwner] = await ethers.getSigners();
      const { wallet } = await deployWalletAndContext();

      const setOwnerCall = wallet.interface.encodeFunctionData("setOwner", [newOwner.address]);

      expect(await wallet.owner()).to.equal(owner.address);

      await wallet.execute(wallet.address, 0, setOwnerCall);

      expect(await wallet.owner()).to.equal(newOwner.address);
    });
  });

  describe("Undirect Transactions", function () {
    it("Should be able to execute function through entryPoint", async function () {
      const [owner, newOwner, external] = await ethers.getSigners();
      const { wallet, entryPoint } = await deployWalletAndContext();

      const setOwnerCall = wallet.interface.encodeFunctionData("setOwner", [newOwner.address]);
      const executeSwapCall = wallet.interface.encodeFunctionData("execute", [
        wallet.address,
        0,
        setOwnerCall
      ]);

      const userOp = await fillAndSignUserOp(
        {
          sender: wallet.address,
          callData: executeSwapCall
        },
        owner,
        entryPoint.address
      );

      expect(await wallet.owner()).to.equal(owner.address);

      await entryPoint.connect(external).handleOps([userOp], owner.address);

      expect(await wallet.owner()).to.equal(newOwner.address);
    });

    it("Should fail on wrong signer", async function () {
      const [owner, newOwner, external] = await ethers.getSigners();
      const { wallet, entryPoint } = await deployWalletAndContext();

      const setOwnerCall = wallet.interface.encodeFunctionData("setOwner", [newOwner.address]);
      const executeSwapCall = wallet.interface.encodeFunctionData("execute", [
        wallet.address,
        0,
        setOwnerCall
      ]);

      const userOp = await fillAndSignUserOp(
        {
          sender: wallet.address,
          callData: executeSwapCall
        },
        newOwner,
        entryPoint.address
      );

      expect(entryPoint.connect(newOwner).handleOps([userOp], owner.address)).to.be.revertedWith(
        "AA24 signature error"
      );
    });
  });

  describe("Features", function () {
    it("Should verify signed positions", async function () {
      const [owner, newOwner, external] = await ethers.getSigners();
      const { wallet, entryPoint } = await deployWalletAndContext();

      const ERC20 = await ethers.getContractFactory("ERC20Token");
      const fromToken = await ERC20.deploy("Token 1", "TKN1", 10);
      const toToken = await ERC20.deploy("Token 2", "TKN2", 10);
      const amount = 5;

      const messageHash = await wallet.getMsgHash(
        fromToken.address,
        amount.toString(),
        toToken.address
      );

      let flatSignature = await owner.signMessage(ethers.utils.arrayify(messageHash));
      let sig = ethers.utils.splitSignature(flatSignature);
      let recovered = await wallet.verifyHash(messageHash, sig.v, sig.r, sig.s);

      const swapCall = wallet.interface.encodeFunctionData("swap", [
        fromToken.address,
        amount,
        toToken.address
      ]);

      const userOp = await fillAndSignUserOp(
        {
          sender: wallet.address,
          callData: swapCall
        },
        owner,
        entryPoint.address
      );

      userOp.signature = flatSignature;

      await entryPoint.connect(external).handleOps([userOp], owner.address);

      console.log("Signing for", fromToken.address, amount.toString(), toToken.address);
    });
  });
});
