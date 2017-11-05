import React, { Component } from 'react'
import PatientDocumentsContract from '../build/contracts/PatientDocuments.json'
import getWeb3 from './utils/getWeb3'
import FileInput from 'react-file-input'
import request from 'superagent'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

function range(n) {
  var nums = [];
  for (var i = 0; i < n; i++) {
    nums.push(i);
  }
  return nums;
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      documents: [],
      web3: null,
      contract: null
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const patientDocs = contract(PatientDocumentsContract)
    patientDocs.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      patientDocs.deployed().then((instance) => {
        this.setState({
          contract: instance
        })
        this.loadExistingDocuments()
      })
    })
  }

  loadExistingDocuments() {
    this.state.contract.numDocuments.call().then((numDocuments) => {
      return Promise.all(range(numDocuments.toNumber()).map(
        (i) => {
          return this.state.contract.getDocument.call(i)
        }
      ));
    }).then((docs) => {
      return this.setState({ documents: docs.map((doc) => doc.slice(2)) })
    });
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    this.setState({file: event.target.files[0]});
  }

  handleSubmit(event) {
    var contract = this.state.contract,
        web3 = this.state.web3;
    request
    .post('http://localhost:8500/bzzr:/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send( this.state.file )
    .end((err, res) => {
      var docHash = "0x" + res.text;
      web3.eth.getAccounts((error, accounts) => {
        return contract.appendDocument(docHash, {from: accounts[0]}).then(() => {
          this.loadExistingDocuments()
        })
      })

    });  
    event.preventDefault();
  }

  render() {
    var imgUrls = this.state.documents.map((doc) => "http://localhost:8500/bzzr:/" + doc)
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Patient Portal</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Patient Portal</h1>
              <p></p>
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
              <div>
                { 
                    imgUrls.map((doc, i) =>
                    <img key={i} src={doc}></img>
                )}
              </div>
            </div>
          </div>
		  <form onSubmit={this.handleSubmit}>
            <label>
              Name:
              <input type="text" value={this.state.value} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
            <FileInput name="myFile"
            placeholder="My file"
            className="inputClass"
            onChange={this.handleChange} />
          </form>
        </main>
      </div>
    );
  }
}

export default App
