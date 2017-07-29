# Escrow Network

This HyperLedger Fabric smart contract defines a two-party business network using the smart contract as the escrow mediator. In addition to the two transacting parties, a bank will be required to participate in the business network. Since hyperledger does not have a native currency to hold or move the escrow funds, the bank will be used for this purpose. This is the standard pattern for HyperLedger financial usecases.

## Workflow

* Seller posts a new purchase order to the smart contract
* The smart contract creates a new account with the network bank
* The escrow account details are notified to buyer and seller
* Buyer and Seller send their deposits to the network bank
* Network bank posts notifications to the smart contract on deposit events
* The smart contract ensures that the deposits are twice the gross amount of the purchase order
* The smart contract updates the order status and sends notifications
* Buyer posts OrderDelivered notification to the smart contract
* The smart contract sends requests to bank for moving the deposit funds back or refund the buyer
* The smart contract updates the purchase order as delivered
* The deposit balances held within the smart socntracts are the representative tokens corresponding to the escrow balances held by the network bank.

---
![Workflow](./escrow.png)
---

Note: The refund procedures in the case of buyer being not happy with the order delivery, will requrie a notary participant or an oracle service to participate in the network and attest the situation requiring a refund. I did not implement the refund scenario to avoid making it complex.

