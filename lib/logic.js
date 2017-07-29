
/**
 * Create the purchase order
 * @param {org.acme.network.escrow.NewPurchaseOrder} txn
 * @transaction
 */
function createPurchaseOrder(txn) {
    // add order data to the asset
    // emit OrderCreateNotification
    // emit AccountCreateNotification
      return getAssetRegistry('org.acme.network.escrow.PurchaseOrder')
        .then(function (registry) {
            var factory = getFactory();
            var newOrder = factory.newResource('org.acme.network.escrow', 'PurchaseOrder', txn.orderId);
            newOrder.seller = txn.seller;
            newOrder.buyer = txn.buyer;
            newOrder.description = txn.description;
            newOrder.grossAmount = txn.grossAmount;
            newOrder.currency = txn.currency;
            newOrder.postingDate = new Date();      

            // emit a notification that a order is created
            var orderCreateNotification = getFactory().newEvent('org.acme.network.escrow', 'OrderCreateNotification');
            orderCreateNotification.orderId = txn.orderId;
            emit(orderCreateNotification);

            // emit a notification (request) for account creation
            var accountCreateRequest = getFactory().newEvent('org.acme.network.escrow', 'AccountCreateRequest');
            accountCreateRequest.orderId = txn.orderId;
            emit(accountCreateRequest);

            return registry.add(newOrder);
        })
        .catch(function (err) {
          throw new Error(err);
        });
}

/**
 * Process acccount create notification from the escrow bank
 * @param {org.acme.network.escrow.NewEscrowAccount} txn
 * @transaction
 */
function confirmCreateEscrowAccount(txn) {
    // update purchase order with account details
    // send AccountCreatedNotification to buyer and seller

    return getAssetRegistry('org.acme.network.escrow.PurchaseOrder')
    .then(function (registry) {
        var order = registry.get(txn.orderId);
        order.escrowAccount = tx.account;

        // emit a notification that a order is created
        var notification = getFactory().newEvent('org.acme.network.escrow', 'AccountCreatedNotification');
        notification.orderId = txn.orderId;
        notification.account = tx.account;
        emit(notification);

        order.orderStatus = OrderStatus.ACCOUNT_CREATED;
        return registry.update(order);
    })
    .catch(function (err) {
      throw new Error(err);
    });

}

/**
 * Process confirmation notification from the escrow bank
 * @param {org.acme.network.escrow.DepositCredit} txn
 * @transaction
 */
function confirmDepositCredit(txn) {
    // find the participant
    // add to deposit
    // send DepositNotification

    var grossAmount = 0.0;
    return getAssetRegistry('org.acme.network.escrow.PurchaseOrder')
    .then(function (registry) {
        order = registry.get(txn.orderId);
        grossAmount = order.grossAmount;
        return getAssetRegistry('org.acme.network.escrow.Party')
    })
   .then(function(registry) {
        // ensure the deposit is double the order gross amount
        party = registry.get(txn.email);
        if (tx.deposit < 2 * grossAmount) {
            throw new Error('Invalid deposit amount');
        }
        party.depositBalance += txn.amount;

        // emit a notification that a deposit is received
        var notification = getFactory().newEvent('org.acme.network.escrow', 'DepositNotification');
        notification.orderId = txn.orderId;
        emit(notification);

        return registry.update(party);
    })
    .catch(function (err) {
      throw new Error(err);
    });

}

/**
 * Process confirmation notification from the escrow bank
 * @param {org.acme.network.escrow.DepositDebit} txn
 * @transaction
 */
function confirmDepositDebit(txn) {
    // find the participant
    // deduct from deposit
    // send DepositNotification
    return getAssetRegistry('org.acme.network.escrow.PurchaseOrder')
    .then(function (registry) {
        order = registry.get(txn.orderId);
        grossAmount = order.grossAmount;
        return getAssetRegistry('org.acme.network.escrow.Party')
    })
   .then(function(registry) {
        // ensure the deposit is double the order gross amount
        party = registry.get(txn.email);
        if (party.depositBalance < txn.amount) {
            throw new Error('Invalid debit amount');
        }
        party.depositBalance -= txn.amount;

        // emit a notification 
        var notification = getFactory().newEvent('org.acme.network.escrow', 'DepositNotification');
        notification.orderId = txn.orderId;
        emit(notification);

        return registry.update(party);
    })
    .catch(function (err) {
      throw new Error(err);
    });
}

/**
 * Process the order shipment notification from the seller
 * @param {org.acme.network.escrow.OrderShipment} txn
 * @transaction
 */
function reportOrderShipment(txn) {
    // send OrderShipmentNotification to buyer and seller
    var notification = getFactory().newEvent('org.acme.network.escrow', 'OrderShipmentNotification');
    notification.orderId = txn.orderId;
    emit(notification);
    return getAssetRegistry('org.acme.network.escrow.PurchaseOrder')
    .then(function (registry) {
        var order = registry.get(txn.orderId);
        order.orderStatus = OrderStatus.SHIPPED;
        return registry.update(order);
    })
    .catch(function (err) {
      throw new Error(err);
    });
}

/**
 * Process the order receive notification from the buyer
 * @param {org.acme.network.escrow.OrderDelivery} txn
 * @transaction
 */
function reportOrderDelivery(txn) {
    // send OrderDeliveryNotification to buyer and seller
    return getAssetRegistry('org.acme.network.escrow.PurchaseOrder')
    .then(function (registry) {
        var order = registry.get(txn.orderId);

        // emit a notification that a order is delivered
        var notification = getFactory().newEvent('org.acme.network.escrow', 'OrderDeliveryNotification');
        notification.orderId = txn.orderId;
        emit(notification);

        // emit a notification (request) to bank to process refund the deposit amount to seller
        var notification = getFactory().newEvent('org.acme.network.escrow', 'MoveFundsrequest');
        notification.orderId = txn.orderId;
        notification.fromAccount = order.escrowAccount;
        notification.toAccount = order.seller.account;
        notification.amount = 3 * order.grossAmount;
        emit(notification);

        // emit a notification (request) to bank to process refund the deposit amount to buyer
        notification = getFactory().newEvent('org.acme.network.escrow', 'MoveFundsrequest');
        notification.orderId = txn.orderId;
        notification.fromAccount = order.escrowAccount;
        notification.toAccount = order.buyer.account;
        notification.amount = order.grossAmount;
        emit(notification);

        order.orderStatus = OrderStatus.DELIVERED;

        return registry.update(order);
    })
    .catch(function (err) {
      throw new Error(err);
    });


}

