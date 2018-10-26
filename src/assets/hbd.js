function load() {
  var red = [0, 100, 63];
  var orange = [40, 100, 60];
  var green = [75, 100, 40];
  var blue = [196, 77, 55];
  var purple = [280, 50, 60];
  var myName = document.getElementById('my-name').value;
  var letterColors=[red, orange, green, blue, purple];

  bubbleShape = "circle";

  drawName(myName, letterColors);
  bounceBubbles();
}
document.getElementById('cake-icon').addEventListener('click', load);
console.log('hola?');
