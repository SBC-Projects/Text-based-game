document.getElementById('textarea').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        var myText = document.getElementById('textarea').value;
        analyseInput(myText);
        document.getElementById('textarea').value = '';
    }
});

document.getElementById('enterButton').addEventListener('click', function() {
    var myText = document.getElementById('textarea').value;
    analyseInput(myText);
    document.getElementById('textarea').value = '';
});

function analyseInput(input) {
    if (input.toLowerCase().includes('show mushroom')) {
        showMushroom();
    } else if(input.toLowerCase().includes('show banana')) {
        showBanana();
    } else if (input.toLowerCase() === 'greet') {
        player.greet();
    } else if (input.toLowerCase().startsWith('math ')) {
        let parts = input.split(' ');
        if (parts.length === 3) {
            let a = parseFloat(parts[1]);
            let b = parseFloat(parts[2]);
            if (!isNaN(a) && !isNaN(b)) {
                player.doMaths(a, b);
            } else {
                document.getElementById('output').textContent = "Invalid numbers";
            }
        }
    } else if (input.toLowerCase() === 'do things') {
        player.doThings();
    } else {
        document.getElementById('output').textContent = input;
    }
}

function showMushroom() {
    document.getElementById('output').textContent = "You see a mushroom! 🍄";
}

function showBanana() {
    var img = document.createElement('img');
    img.src = 'images/BananaWalk.gif';
    img.style.position = 'absolute';
    img.style.left = '50%';
    img.style.top = '20%';
    img.style.transform = 'translateX(-50%)';
    document.body.appendChild(img);
}

class Player {
    constructor() {
        this.name = "Bob";
        this.healthPoints = 3;
        this.bag = ["map", "torch"];
    }

    greet() {
        document.getElementById('output').textContent = "Hello!";
    }

    doMaths(a, b) {
        let result = a * b;
        document.getElementById('output').textContent = result;
    }

    doThings() {
        this.name += 's';
        this.healthPoints += 1;
        let bagString = this.bag.join(', ');
        document.getElementById('output').textContent = bagString;
    }
}

let player = new Player();




