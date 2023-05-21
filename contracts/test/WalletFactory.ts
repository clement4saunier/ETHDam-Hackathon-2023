import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { fillAndSignUserOp } from "./UserOpUtils";
import { AbiCoder } from "@ethersproject/abi";
import { encode } from "punycode";
import { getContractFactory } from "@nomiclabs/hardhat-ethers/types";
import { hexZeroPad } from "ethers/lib/utils";

async function query(instance, event, args) {
  return await instance.queryFilter({
    address: instance.address,
    topics: [ethers.utils.id(event), ...args],
    fromBlock: 92678450
  });
}

const CREATE_EVENT = "Create(address,address)";

describe("WalletFactory", function () {
  async function deployWalletAndContext() {
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();

    const Factory = await ethers.getContractFactory("WalletFactory");
    const factory = await Factory.deploy(entryPoint.address, entryPoint.address);

    return { factory, entryPoint };
  }

  describe("Deployment", function () {
    it("Should set the right owner & entrypoint", async function () {
      const [owner] = await ethers.getSigners();
      const { factory, entryPoint } = await deployWalletAndContext();

      await factory.createWallet();

      await factory.walletOf(owner.address);
    });
  });
});
