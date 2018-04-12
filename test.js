import capnp from 'capnp';
import schema from './zmq/schema.capnp';
import protobuf from 'protobufjs';

const baseObject = {
 "newOrderRequest":
 {
   "userID": "USER_0001",
   "orderID": "aowiefasmnie",
   "orderType": "limit",
   "sellingCurrency": "BTC",
   "sellingQty": 1,
   "buyingCurrency": "USD",
   "buyingQty": 3,
   "userData": ""
 }
};

var start = Date.now();
var buffer = capnp.serialize(schema.APIMessage, baseObject);
for (var i = 0; i < 1e5; i++)
	buffer = capnp.serialize(schema.APIMessage, capnp.parse(schema.APIMessage, buffer));

console.log(`100000 capnproto iterations in ${Date.now() - start} ms`);
console.log(`Size of capnproto buffer: ${buffer.length}`);
console.log(`Size of straight JSON string: ${JSON.stringify(baseObject).length}`);
console.log(JSON.stringify(capnp.parse(schema.APIMessage, buffer), null, 1));
start = Date.now();
protobuf.load("test.proto", function(err, root) {
    if (err)
        throw err;
 
   
    const msg = root.lookupType("test.APIMessage");
    var buffer = msg.encode(msg.create(baseObject)).finish();
    for (var i = 0; i < 1e5; i++)
	buffer = msg.encode(msg.create(msg.toObject(msg.decode(buffer)))).finish();


console.log(`100000 protobuf iterations in ${Date.now() - start} ms`);
console.log(`Size of protobuf buffer: ${buffer.length}`);
console.log(`Size of straight JSON string: ${JSON.stringify(baseObject).length}`);
console.log(JSON.stringify(msg.toObject(msg.decode(buffer), {longs: String}), null, 1));
});

