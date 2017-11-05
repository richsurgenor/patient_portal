var SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract('SimpleStorage', function(accounts) {
  var exampleDoc = "0x5dbbcd43ee677d7acd385afd170372788cf0460733bf28dcde0bebb6b33a68f9",
      account0 = accounts[0];

  it("Should provide document access", function() {
    var contract;
    return SimpleStorage.deployed().then(function(instance) {
      contract = instance;
      return contract.numDocuments.call();
    }).then(function(numDocuments) {
      assert.equal(numDocuments, 0, "expected no documents initially");
      return contract.appendDocument(exampleDoc, {from: account0});
    }).then(function() {
      return contract.getDocument.call(0);
    }).then(function(fetchedDoc) {
      assert.equal(fetchedDoc, exampleDoc, "the retreived document does not match");
      return contract.numDocuments.call();
    }).then(function(numDocs) {
      assert.equal(numDocs, 1, "expected a single document");
    });
  });
});

