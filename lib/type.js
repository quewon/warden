var Type = {
  loop: undefined,
  stopTyping: false,
  finishTyping: false
};

function type(element, content, speed, func) {
  cancelAnimationFrame(Type.loop);
  Type.stopTyping = true;

  speed = speed || 1;

  element.innerHTML = "";

  let stripped = content.replace(/<br>/g, "¶");
  stripped = stripped.replace(/<hr>/g, "≡");
  stripped = stripped.split(/(?:\/b>)/g);

  if (stripped.length==1) {
    element.innerHTML = stripped[0];
    stripped[0] = element.textContent;
    element.innerHTML = "";
    stripped = stripped[0].split("");
  } else if (stripped.length > 1) {
    element.innerHTML = stripped[1];
    stripped[1] = element.textContent;
    element.innerHTML = "";
    stripped[1] = stripped[1].split("");
    stripped = stripped.flat();
  }

  var counter = 0;
  var charcount = 0;
  var pause = 0;

  if (func) func();

  setTimeout(function() {
    Type.stopTyping = false;
    Type.finishTyping = false;
    animate();
  }, 100);

  function animate() {
    if (Type.finishTyping) {
      element.innerHTML = content;
      if (func) func();
      return;
    }

    if (pause > 0) {
      pause--;
      if (!Type.stopTyping)Type.loop = requestAnimationFrame(animate);
      return;
    }
    if (counter==speed) {
      counter = 0;
      let char = stripped[charcount];

      switch (char) {
        case ".":
        case ":":
        case "!":
        case "?":
          pause = 6*speed;
          break;
        case ",":
          pause = 5*speed;
          break;
        case "¶":
          char = "<br>";
          pause = 2*speed;
          break;
        case "≡":
          char = "<hr>";
          pause = 2*speed;
          break;
      }

      element.innerHTML += char;
      charcount++;
      pause += Math.floor(Math.random() * 3)*speed;
    }
    if (charcount==stripped.length) {
      element.innerHTML = content;
    } else {
      counter++;
      pause += Math.floor(Math.random() * 2)*speed;
      if (!Type.stopTyping) Type.loop = requestAnimationFrame(animate);
    }
  }
}

function typeWords(element, content, s, func) {
  cancelAnimationFrame(Type.loop);
  Type.stopTyping = true;

  s = s || 2;

  element.innerHTML = content;
  let stripped = element.textContent;
  element.innerHTML = "";
  stripped = stripped.split(" ");
  stripped.unshift("");
  stripped.push("");

  var speed = s;
  var counter = 0;
  var wordcount = 0;
  var pause = 0;
  
  setTimeout(function() {
    Type.stopTyping = false;
    animate();
  }, 100);

  function animate() {
    if (pause > 0) {
      pause--;
      if (!Type.stopTyping)Type.loop = requestAnimationFrame(animate);
      return;
    }
    if (counter==speed) {
      counter = 0;
      let word = stripped[wordcount];

      pause = word.length*s;

      if (word == "") pause = Math.floor(Math.random() * 20)*s;

      const lastchar = word.slice(-1);

      let p = document.createElement("span");

      if (
        lastchar == "." ||
        lastchar == ":" ||
        lastchar == "!" ||
        lastchar == "?" ||
        lastchar == ","
      ) {
        pause += 7*s;
        stripped[wordcount+1] = lastchar+" "+stripped[wordcount+1];
        word = word.slice(0, -1);
        p.textContent = word;
      } else {
        p.textContent = word+" ";
      }

      setTimeout(function () {
          p.classList.add("fade-in");
      }, 10);

      element.appendChild(p);

      pause += Math.floor(Math.random() * 2)*s;

      wordcount++;
    }
    if (wordcount>=stripped.length) {
      setTimeout(function () {
        element.innerHTML = content;
        if (func) func();
      }, 310);
    } else {
      counter++;
      if (!Type.stopTyping)Type.loop = requestAnimationFrame(animate);
    }
  }
}