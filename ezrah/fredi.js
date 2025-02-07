
var tabCmds = [];
let cm = [];

function fredi(obj, fonctions) {
    let infoComs = obj;

    if (!obj.categorie) {
        infoComs.categorie = "General";
    }
    if (!obj.reaction) {
        infoComs.reaction = "🍁";
    }
    if (!obj.desc) {
        infoComs.desc = "Hi hi my friend!!";
    }

    infoComs.fonction = fonctions;
    cm.push(infoComs);

    // console.log('chargement...')
    return infoComs;
}

module.exports = { fredi, Module: fredi, cm };
