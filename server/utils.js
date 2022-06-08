export  {
   makeid,
   defaultColor,
   defaultName,
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

function defaultColor() {
   return "#"+Math.floor(Math.random()*16777215).toString(16);
}

function defaultName(playerNumber) {
   return `Player_${playerNumber + 1}`;
}
