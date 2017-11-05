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
      encryptedDocs: [],
      decryptedDocs: [],
      web3: null,
      contract: null,
      password: ''
    }

    this.documentSubmitted = this.documentSubmitted.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.passwordUpdated = this.passwordUpdated.bind(this);

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
               .end((err, res) => {
                 this.setState({encryptedDocs: this.state.encryptedDocs.concat([res.text])});
               });
      }))
    })
  }

  decryptImages(password) {
    var decryptedDocs = [];
    try {
      decryptedDocs = this.state.encryptedDocs.map((doc) => {
        var decryptedImage = sjcl.decrypt(password, doc);
        return 'data:image/jpeg;base64,' + decryptedImage;
      })
    } catch(e) {
      console.log("Failed to decrypt images", e)
    }
    this.setState({decryptedDocs: decryptedDocs})
  }

  passwordUpdated(event) {
    var pw = event.target.value
    this.setState({password: pw})
    this.decryptImages(pw)
  }

  documentSubmitted(event) {
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
      var b64 = arrayBufferToBase64(this.result)
      console.log("encrypting with", state.password);
      var data = sjcl.encrypt(state.password, b64);
      request.post('http://localhost:8500/bzzr:/')
             .set('Content-Type', 'application/octet-stream')
             .send(data)
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
    var docSrc = (this.state.decryptedDocs.length === 0) ?
          this.state.encryptedDocs.map(() => ["lock-img.png", "document-locked"]) :
          this.state.decryptedDocs.map((src) => [src, "document-unlocked"])
    var passwordValid = this.state.password.length;
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Patient Portal</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Patient Account</h1>
              Encryption key: <input className={passwordValid ? "" : "invalid-password"} type="password" value={this.state.password} onChange={this.passwordUpdated}/>
              <h1>Document Archive</h1>
              <div className="historical-documents">
              { 
                docSrc.map((img, i) =>
                    <img className={img[1]} key={i} src={img[0]}></img>
              )}
              </div>
              <h1>Document Upload</h1>
              <div className="document-upload">
		        <form onSubmit={this.handleSubmit}>
                  <label>
                    <input type="text" value={this.state.value} onChange={this.documentSubmitted} />
                  </label>
                  <input disabled={passwordValid ? "" : "disabled"} type="submit" value="Submit" />
                  <FileInput name="myFile"
                  placeholder="My file"
                  className="inputClass"
                  onChange={this.documentSubmitted} />
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
