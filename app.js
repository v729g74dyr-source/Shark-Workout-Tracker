
const quotes=['Discipline remembers what motivation forgets.','Log it. Beat it.','Small wins become strength.'];
document.getElementById('quote').innerText=quotes[new Date().getDate()%quotes.length];
