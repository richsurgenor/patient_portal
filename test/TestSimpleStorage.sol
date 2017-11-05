pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SimpleStorage.sol";

contract TestSimpleStorage {
  function testItStoresDocuments() public {
    SimpleStorage simpleStorage = SimpleStorage(DeployedAddresses.SimpleStorage());
    Assert.equal(simpleStorage.numDocuments(), 0, "Should be initially empty");

    simpleStorage.appendDocument(0x5dbbcd43ee677d7acd385afd170372788cf0460733bf28dcde0bebb6b33a68f9);
    simpleStorage.appendDocument(0x1111111111111111111111111111111111111111111111111111111111111111);

    Assert.equal(simpleStorage.getDocument(0), 0x5dbbcd43ee677d7acd385afd170372788cf0460733bf28dcde0bebb6b33a68f9, "It should retrieve first document");
    Assert.equal(simpleStorage.getDocument(1), 0x1111111111111111111111111111111111111111111111111111111111111111, "It should retrieve second document");
    Assert.equal(simpleStorage.numDocuments(), 2, "Should contain 2 documents");
  }
}
