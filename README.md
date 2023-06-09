# README - AutoFi
![Logo](https://github.com/clement4saunier/ETHDam-Hackathon-2023/assets/2742107/71473750-6892-4af2-8a50-81255a174cfe)

`AutoFi ~ Automate your investing`

## Introduction
AutoFi is our submission for the ETHDam 2023 hackathon. In this README, we'll provide an overview of our core idea, the solution and tech stack.


## Project Overview
AutoFi is an easy-to-use dApp to help users automate their DeFi investing. It offers the ability to schedule automated transactions, providing convenience and control without giving up custody. After talking to multiple users with basic crypto experience, we realized a lot of DeFi applications are just too complex if you’re not crypto-native. Therefore, we started our integration with Dollar-cost-averaging (DCA), perhaps the most common investment practice for the everyday person.

> **_Why Dollar-cost averaging?_**
>
> _Dollar-cost averaging is a strategy an investor can use to build savings and wealth over a long period, while neutralizing the short-term volatility in the market. The purchases occur regardless of the asset's price and at regular intervals. In effect, this strategy removes a lot of the detailed work attempting to time the market in order to make purchases at the best price. With AutoFi you can just set-and-forget: never skip a transaction because you were busy, nervous or trying to play smart._


## Functionality
Our simple UI provides the following functionalities and benefits:
* Convenience: just specify a budget and interval and AutoFi will figure out the rest. By using smart routing and aggregation, we can execute your USDC/ETH swap with competitive fees and at the best available rate.
* Accessibility: AutoFi is offered through a user-friendly web interface, on desktop and mobile - making it accessible to use at home or on the go. Just sign in with your socials!
* Simplicity: we abstracted away complications that are disrupting the user experience, with technologies like Account Abstraction and gasless transactions. For example: you can modify your swap configuration in just two clicks, without additional transaction costs.
* Security: avoid over-exposure and top up your non-custodial AutoFi wallet with only the amount you’re swapping. Best of all: when your swap is complete, AutoFi will automagically send funds back to your funding wallet, or a cold wallet of your choice.


## Tech Stack

1. Account Abstraction -- vanilla smart contract
2. Smart Aggregation -- 1inch router
3. Web2 Accounts -- sismo connect

For more detailed information on the implementation of our functionality, please refer to the relevant sections of code in our repository.

### How to run

```
docker compose up --build
```

The docker compose config will run a local shadowfork of Arbitrum and deploy our contracts, as well as run the frontend, backend & db.

### Deployment

The contracts are deployed on Scroll Alpha L2:

* Entrypoint: 0x36b58F5C1969B7b6591D752ea6F5486D069010AB
* WalletFactory: 0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7


![LOGO](https://github.com/clement4saunier/ETHDam-Hackathon-2023/assets/2742107/40ad9709-a89b-4e48-a54d-9cadca0068e1)

![Desktop Responsive-0](https://github.com/clement4saunier/ETHDam-Hackathon-2023/assets/2742107/43d5a298-2072-42fc-bf12-9e5e1f5e0dbf)
![Desktop Responsive-1](https://github.com/clement4saunier/ETHDam-Hackathon-2023/assets/2742107/4c593484-0bc1-42c3-9d00-f2e854447a62)
![Banner](https://github.com/clement4saunier/ETHDam-Hackathon-2023/assets/2742107/0d49ccd2-52c0-478f-83cb-c56922179465)

![LOGO](https://github.com/clement4saunier/ETHDam-Hackathon-2023/assets/2742107/6e459500-321d-418b-97ba-e82a03e407eb)
