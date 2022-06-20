export  {
   makeid,
   combineKeys,
   splitKey,
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function isPrime(num) {
   const sqrt = Math.sqrt(num)
   for (let divisor = 2; divisor <= sqrt; divisor++) {
       if (num % divisor === 0) {return false;} 
   }
   return num > 1;
}

function combineKeys(keys) {
   let resultKey = 1;
   let prime = 1;
   keys.forEach( key => {
      prime ++;
      while (!isPrime(prime)) {
         prime ++;
      }
      resultKey *= prime ** key;
   });
   return resultKey;
}

function splitKey(key) {
   let resultKeys = [];
   let remainder = Math.round(key);
   let prime = 1;
   while (remainder > 1) {
      if (remainder < prime) {
         console.log("error splitKey", key);
         break;
      }
      prime ++;
      while (!isPrime(prime)) {
         prime ++;
      }
      let divisor = 0;
      while (!(remainder % prime)) {
         remainder = Math.floor(remainder / prime);
         divisor ++;
      }
      resultKeys.push(divisor);
   }
   return resultKeys;
}