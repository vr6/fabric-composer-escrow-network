# Escrow Network

> This HyperLedger Fabric smart contract defines a two-party business network using the smart contract as the escrow mediator. In addition to the two transacting parties, a bank will be required to participate in the business network. Since hyperledger does not have a native currency to hold or move the escrow funds, the bank will be used for this purpose. This is the standard pattern for HyperLedger financial usecases.

The following is the workflow:

o Seller posts a new purchase order to the smart contract
o The smart contract creates a new account with the network bank
o The escrow account details are notified to buyer and seller
o Buyer and Seller send their deposits to the network bank
o Network bank posts notifications to the smart contract on deposit events
o The smart contract ensures that the deposits are twice the gross amount of the purchase order
o The smart contract updates the order status and sends notifications
o Buyer posts OrderDelivered notification to the smart contract
o The smart contract sends requests to bank for moving the deposit funds back or refund the buyer
o The smart contract updates the purchase order as delivered
o The deposit balances held within the smart socntracts are the representative tokens corresponding to the escrow balances held by the network bank.

