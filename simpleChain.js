/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
/* ===== Leveldb ===============================
|  Learn more: level: https://github.com/Level/level      |
|  =========================================================*/
const level = require('level');
const chainDB = './chaindata2';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = [];
    this.addBlock(new Block("First block in the chain - Genesis block"));
  }
   // Add Genesis block
  addGenesisBlock(){
    
    // Adding block object to chain leveldb
    var d=[];
    
   var stream= db.createReadStream() ;
   stream.on('data', function(data) {
      d.push(data.value);
            }).on('close', function() {
               console.log("inside strem on" + d.length);
               //newBlock.height = d.length;
               if (d.length===0){
                 
                  let newBlock=new Block("First block in the chain - Genesis block");
                  // Block height
                  newBlock.height = 0;
                  // UTC timestamp
                  newBlock.time = new Date().getTime().toString().slice(0,-3);  
                 
                  // Block hash with SHA256 using newBlock and converting to a string
                  newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                  db.put(newBlock.height, JSON.stringify(newBlock), function(err) {
                      if (err) return console.log('Block ' + key + ' submission failed', err);
                                         }) ;
                                
          
               }
             
        })
  }
    
  // Add new block
  addBlock(newBlock){
  
  
  
  
   //Variables to handle getting data from stream data event  
   var d=[];
    
   var stream= db.createReadStream() ;
   stream.on('data', function(data) {
      d.push(data.value);
            }).on('close', function() {
               console.log("inside strem on" + d.length);
               //
               if (d.length>0){
                 
                 
                  // Block height
                  newBlock.height = d.length;
                  // previous block hash
                  db.get(d.length-1, function(err, value) {
                       if (err) return console.log('Not found!', err);
                             let bb=   JSON.parse(value);
                             newBlock.previousBlockHash=bb.hash;  });  
                  // UTC timestamp
                  newBlock.time = new Date().getTime().toString().slice(0,-3);    
                  // Block hash with SHA256 using newBlock and converting to a string
                  newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                  db.put(newBlock.height, JSON.stringify(newBlock), function(err) {
                      if (err) return console.log('Block ' + newBlock.height + ' submission failed', err);
                                         }) ;
                                
          
               }
             
        });
   
  }

  // Get block height
    getBlockHeight(){
     // return this.chain.length-1;
      //Variables to handle getting data from stream data event  
   var d=[];
    
   var stream= db.createReadStream() ;
   stream.on('data', function(data) {
      d.push(data.value);
            }).on('close', function() {return d.length-1; });
    }

    // get block
    getBlock(blockHeight){
      // return object as a single string
     
       db.get(blockHeight, function(err, value) {
                       if (err) return console.log('Not found!', err);
                             let block=   JSON.parse(value);
                            return block;  }); 
     
     
    }

    // validate block
    validateBlock(blockHeight){
      // get block object
      let block = this.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      for (var i = 0; i < this.chain.length-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.chain[i].hash;
        let previousHash = this.chain[i+1].previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
}
