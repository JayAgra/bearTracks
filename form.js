//missed lower
function incValueMissedLower()
{
    var value = parseInt(document.getElementById('missedlower').value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    document.getElementById('missedlower').value = value;
}
//made lower
function incValueMadeLower()
{
    var value = parseInt(document.getElementById('madelower').value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    document.getElementById('madelower').value = value;
}
//missed upper
function incValueMissedUpper()
{
    var value = parseInt(document.getElementById('missedupper').value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    document.getElementById('missedupper').value = value;
}
//made upper
function incValueMadeUpper()
{
    var value = parseInt(document.getElementById('madeupper').value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    document.getElementById('madeupper').value = value;
}