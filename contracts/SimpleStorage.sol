pragma solidity ^0.4.18;

contract SimpleStorage {
  bytes32[] documents;

  function numDocuments() public returns (uint) {
      return documents.length;
  }

  function appendDocument(bytes32 doc) public {
      documents.push(doc);
  }

  function getDocument(uint i) public returns (bytes32) {
      return documents[i];
  }
}
