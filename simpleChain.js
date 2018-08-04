/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
/* ===== Leveldb ===============================
|  Learn more: level: https://github.com/Level/level      |
|  =========================================================*/
const level = require('level');
const chainDB = './chaindataelb';
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
  this.addGenesisBlock(new Block("First block in the chain - Genesis block"));
  }
  
  // ======================Helper Methods Section====================================== 
  
  //Get the value of all data in the Leveldb and return a promise
  getAllData() {
    return new Promise(function(resolve, reject) {
    var alldata=[];
        db.createReadStream({ keys: false, values: true }).on('data', function(data) {
        alldata.push(data);
       
           
        }).on('close', function() {
          resolve(alldata);
        });
    });
}
  
//===================end of helper Methods Section======================================


//====================start of Class Methods====================================

 // Method called only at the constuctor to generate first Genesis Block if no block is in the chain
 async addGenesisBlock(newBlock){

    // waits to get all values array
    let alldata= await this.getAllData();
    
    
    if (alldata.length===0){
              
       // Block height   
        newBlock.height = 0;
      // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
      // previous block hash
        newBlock.previousBlockHash ="";
      // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
     // Adding block object to chain
  	    db.put(newBlock.height, JSON.stringify(newBlock), function(err) {
              if (err) return console.log('Block ' + newBlock.height + ' submission failed', err);
                }) ; 
    
    }
}

 

 async addBlock(newBlock){
    // waits to get all values array
  let alldata= await this.getAllData();
    
    
    if (alldata.length>0){
              
       // Block height   
        newBlock.height = alldata.length;
      // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
      // previous block hash
        newBlock.previousBlockHash =JSON.parse(alldata[alldata.length-1]).hash;
      // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
     // Adding block object to chain
  	    db.put(newBlock.height, JSON.stringify(newBlock), function(err) {
              if (err) return console.log('Block ' + newBlock.height + ' submission failed', err);
                }) ; 
    
    }
}

 
 
 
 
  // Get block height
    getBlockHeight(){
     return new Promise(function(resolve, reject) {
    var alldata=[];
        db.createReadStream({ keys: false, values: true }).on('data', function(data) {
        alldata.push(data);
       
           
        }).on('close', function() {
          resolve(alldata.length-1);
        });
    });
    }

    // get block
   async getBlock(blockHeight){   
    
          let block= await  db.get(blockHeight);;
                      
        return JSON.parse(block);
     
    }

    
    
    
 async validateBlock(blockHeight){
 
    // get block object
      let block = await this.getBlock(blockHeight);
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
          
          return false;
        }
       
    }   
   
    
    
    
    
// Validate blockchain
  async validateChain(){
      let errorLog = [];
      let alldata= await this.getAllData();
      for (var i=0; i<alldata.length-1;i++){
          const validBlock=await this.validateBlock(i);
          if (!validBlock)errorLog.push(i);
          let blockHash = JSON.parse(alldata[i]).hash;
          let previousHash = JSON.parse(alldata[i+1]).previousBlockHash;
          if (blockHash!==previousHash) {
            errorLog.push(i);
          }
      
      }
      const validBlock=await this.validateBlock(alldata.length-1);
          if (!validBlock)errorLog.push(alldata.length-1);
       if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
      
    }    
    
  
   
  }

