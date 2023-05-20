# README - AutoFi
`AutoFi ~ Automate your investing`

## Introduction
AutoFi is our submission for the ETHDam 2023 hackathon. In this README, we'll provide an overview of our core idea, the solution and tech stack.

## Project Overview
AutoFi is an easy-to-use dApp to help users automate their investing. It offers the ability to schedule automated transactions, providing convenience and control. After talking to multiple users with basic crypto experience, we realized a lot of DeFi applications are just too complex if you’re not crypto-native. Therefore, we started our integration with Dollar-cost-averaging (DCA), perhaps the most common investment practice for the everyday person.

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
