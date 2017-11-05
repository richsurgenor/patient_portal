pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/PatientDocuments.sol";

contract TestPatientDocuments {
  function testItStoresDocuments() public {
    PatientDocuments docs = PatientDocuments(DeployedAddresses.PatientDocuments());
    Assert.equal(docs.numDocuments(), 0, "Should be initially empty");

    docs.appendDocument(0x5dbbcd43ee677d7acd385afd170372788cf0460733bf28dcde0bebb6b33a68f9);
    docs.appendDocument(0x1111111111111111111111111111111111111111111111111111111111111111);

    Assert.equal(docs.getDocument(0), 0x5dbbcd43ee677d7acd385afd170372788cf0460733bf28dcde0bebb6b33a68f9, "It should retrieve first document");
    Assert.equal(docs.getDocument(1), 0x1111111111111111111111111111111111111111111111111111111111111111, "It should retrieve second document");
    Assert.equal(docs.numDocuments(), 2, "Should contain 2 documents");
  }
}
