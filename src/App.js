import React, { Component } from 'react'
import PatientDocumentsContract from '../build/contracts/PatientDocuments.json'
import getWeb3 from './utils/getWeb3'
import FileInput from 'react-file-input'
import request from 'superagent'
import sjcl from 'sjcl'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

function arrayBufferToBase64(ab) {
  var binary = '';
  var bytes = new Uint8Array(ab);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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
      var urls = docs.map((doc) =>
          "http://localhost:8500/bzzr:/" + doc.slice(2))

      return Promise.all(urls.map((url) => {
        request.get(url)
               .responseType('arraybuffer')
               .end((err, res) => {
                 var decryptedImage = sjcl.decrypt('password', res.body );
                 var base64 = 'data:image/jpeg;base64,' + decryptedImage;
                 this.setState({documents: this.state.documents.concat([base64])});
               });
      }))
    })
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    this.setState({file: event.target.files[0]});
  }

  handleSubmit(event) {
    var contract = this.state.contract,
        web3 = this.state.web3;

    var state = this.state,
        fr = new FileReader();
    fr.readAsArrayBuffer(this.state.file);
    fr.onload = function(result) {
      request.post('http://localhost:8500/bzzr:/')
             .set('Content-Type', 'application/octet-stream')
             .send( sjcl.encrypt( 'password', arrayBufferToBase64(this.result) ) )
             .end((err, res) => {
               var docHash = "0x" + res.text;
               console.log("Loaded ", docHash, " into swarm")
               state.web3.eth.getAccounts((error, accounts) => {
                 return state.contract.appendDocument(docHash, {from: accounts[0]}).then(() => {
                   alert("File saved")
                 })
               })
      });  
    };
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Patient Portal</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Historial Documents</h1>
              <div className="historical-documents">
              { 
                this.state.documents.map((doc, i) =>
                    <img key={i} src={doc}></img>
              )}
              </div>
              <h1>Document Upload</h1>
              <div className="document-upload">
		        <form onSubmit={this.handleSubmit}>
                  <label>
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                  </label>
                  <input type="submit" value="Submit" />
                  <FileInput name="myFile"
                  placeholder="My file"
                  className="inputClass"
                  onChange={this.handleChange} />
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
