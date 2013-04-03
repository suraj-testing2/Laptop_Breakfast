

function testAssignmentInCondition() {
    var other = 'prop';
    var name = 'value';
    console.assert((other = name) === 'value');
}

function testShortCurcuit() {
    var lhs = false;
    // LHS is false, RHS is not evaluated, result is false
    var isFalse = lhs && console.error('&& Not shortCurcuited');
    console.assert(!isFalse);
    lhs = true;
    // LHS is true, RHS is not evaluated, result is true
    var isTrue = lhs || console.error('|| Not shortCurcuited');
    console.assert(isTrue);
}

function testTypeof() {
    var isAnUndefined = typeof anUndefined !== "undefined";
    console.assert(!isAnUndefined);
}

function testConditionalExpression() {
  var isNull = null;
  var isTrue = isNull ? isNull.name() : true;
  console.assert(isTrue);
}

function testForIn() {
  var prop;
  var loaded = {foo: false};
  for (prop in loaded) {
      if (!loaded[prop]) 
              break;
  }
}

function testConst() {
  const isConst = 5;
  console.assert(isConst);
}

function onLoad() {
  testAssignmentInCondition();
  testShortCurcuit();
  testTypeof();
  testConditionalExpression();
  testForIn();
  testConst();
  console.warn("Tests complete");  
}

window.addEventListener('load',onLoad);