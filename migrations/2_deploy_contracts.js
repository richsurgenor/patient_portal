var PatientDocuments = artifacts.require("./PatientDocuments.sol");

module.exports = function(deployer) {
  deployer.deploy(PatientDocuments);
};
