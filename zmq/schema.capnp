@0xd908e1cdf0dd8aff;

struct PriceLevel {
    price @0 :Float64;
    qty @1 :UInt64;
}

struct ExchangeUserData {
    userID @0 :Text;
    orderID @1 :Text;
    currency @2 :Text;
    qty @3 :UInt64;
}

struct APIMessage {
    union {
        syncRequest :group {
            from @10 :UInt64;
        }
        newOrderRequest :group {
            userID @0 :Text;
            orderID @1 :Text;
            orderType @2 :Text;
            sellingCurrency @3 :Text;
            sellingQty @4 :UInt64;
            buyingCurrency @5 :Text;
            buyingQty @6 :UInt64;
            userData @7 :Text;
        }
        orderStatusRequest :group {
            userID @11 :Text;
            orderID @8 :Text;
        }
        activeOrdersRequest :group {
            userID @12 :Text;
        }
        orderCancelRequest :group {
            userID @13 :Text;
            orderID @9 :Text;
        }
        syncStatus :group {
            nextSeqNumber @14 :UInt64;
        }
        orderStatus :group {
            seqNumber @15 :UInt64;
            userID @16 :Text;
            orderID @17 :Text;
            creationTime @18 :UInt64;
            completionTime @19 :UInt64;
            orderType @20 :Text;
            sellingCurrency @21 :Text;
            soldQty @22 :UInt64;
            origSellingQty @23 :UInt64;
            buyingCurrency @24 :Text;
            boughtQty @25 :UInt64;
            origBuyingQty @26 :UInt64;
            userData @27 :Text;
        }
        exchange :group {
            seqNumber @28 :UInt64;
            executionTime @38 :UInt64;
            exchangeUserData1 @29 :ExchangeUserData;
            exchangeUserData2 @30 :ExchangeUserData;
        }
        infoMessage :group {
            userID @31 :Text;
            orderID @32 :Text;
            text @33 :Text;
        }
        book :group {
            seqNumber @53 :UInt64;
            baseCurrency @34 :Text;
            quoteCurrency @35 :Text;
            bids @36 :List(PriceLevel);
            asks @37 :List(PriceLevel);
        }
        bar :group {
            buyingCurrency @39 :Text;
            sellingCurrency @40 :Text;
            resolution @41 :UInt64;
            time @42 :UInt64;
            maxPrice @43 :Float64;
            minPrice @44 :Float64;
            openPrice @45 :Float64;
            closePrice @46 :Float64;
            volume @47 :UInt64;
        }
        barRequest :group {
            buyingCurrency @48 :Text;
            sellingCurrency @49 :Text;
            resolution @50 :UInt64;
            from @51 :UInt64;
            to @52 :UInt64;
        }
    }
}